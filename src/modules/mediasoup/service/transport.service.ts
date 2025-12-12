import { Injectable, Logger } from '@nestjs/common';
import type { WebRtcTransport, DtlsParameters } from 'mediasoup/node/lib/WebRtcTransportTypes';
import { webRtcTransport_options } from '../media.config';
import { RoomService } from './room.service';
import { TransportOptions } from './types/transport.type';

@Injectable()
export class TransportService {
    private readonly logger = new Logger(TransportService.name);
    private disconnectionTimeouts = new Map<string, NodeJS.Timeout>();

    constructor(private readonly roomService: RoomService) {}

    public async createWebRtcTransport(
        roomId: string,
        peerId: string,
        direction: 'send' | 'recv',
    ): Promise<TransportOptions> {
        const room = this.roomService.getRoom(roomId);
        if (!room) {
            throw new Error(`Room ${roomId} not found`);
        }

        const transport: WebRtcTransport = await room.router.createWebRtcTransport({
            ...webRtcTransport_options,
            appData: {
                peerId,
                clientDirection: direction,
            },
        });

        this.roomService.addPeerToRoom(roomId, peerId);

        const peer = room.peers.get(peerId);
        peer.transports.set(transport.id, transport);

        // Устанавливаем обработчики событий для отслеживания разрыва соединения
        this.setupTransportEventHandlers(transport, roomId, peerId);

        this.logger.log(`WebRTC transport ${transport.id} created for peer ${peerId} (${direction})`);

        return {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
        };
    }

    public async connectTransport(transportId: string, dtlsParameters: DtlsParameters): Promise<void> {
        const transport = this.findTransportById(transportId);
        if (!transport) {
            throw new Error(`Transport ${transportId} not found`);
        }

        if (transport.closed) {
            throw new Error(`Transport ${transportId} is closed`);
        }

        await transport.connect({ dtlsParameters });
        this.logger.log(`Transport ${transportId} connected`);
    }

    private findTransportById(transportId: string): WebRtcTransport | null {
        const rooms = this.roomService.getAllRooms();
        for (const room of rooms.values()) {
            for (const peer of room.peers.values()) {
                const transport = peer.transports.get(transportId);
                if (transport) {
                    return transport;
                }
            }
        }

        return null;
    }

    private setupTransportEventHandlers(
        transport: WebRtcTransport,
        roomId: string,
        peerId: string,
    ): void {
        // Отслеживаем изменения DTLS состояния
        transport.on('dtlsstatechange', (dtlsState) => {
            const transportId = transport.id;
            this.logger.log(`Transport ${transportId} (peer ${peerId}) DTLS state: ${dtlsState}`);

            this.handleConnectionStateChange(transport, roomId, peerId, transportId);
        });

        // Отслеживаем изменения ICE состояния
        transport.on('icestatechange', (iceState) => {
            const transportId = transport.id;
            this.logger.log(`Transport ${transportId} (peer ${peerId}) ICE state: ${iceState}`);

            this.handleConnectionStateChange(transport, roomId, peerId, transportId);
        });

        // Обработка закрытия транспорта
        transport.on('@close', () => {
            const transportId = transport.id;
            this.logger.warn(`Transport ${transportId} (peer ${peerId}) closed`);

            // Очищаем таймаут, если был
            const existingTimeout = this.disconnectionTimeouts.get(transportId);
            if (existingTimeout) {
                clearTimeout(existingTimeout);
                this.disconnectionTimeouts.delete(transportId);
            }

            this.removeTransportFromRoom(roomId, peerId, transportId);
        });
    }

    private handleConnectionStateChange(
        transport: WebRtcTransport,
        roomId: string,
        peerId: string,
        transportId: string,
    ): void {
        const iceState = transport.iceState;
        const dtlsState = transport.dtlsState;

        // Очищаем предыдущий таймаут, если был
        const existingTimeout = this.disconnectionTimeouts.get(transportId);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
            this.disconnectionTimeouts.delete(transportId);
        }

        // Проверяем, разорвано ли соединение
        const isDisconnected =
            iceState === 'disconnected' ||
            iceState === 'closed' ||
            dtlsState === 'failed' ||
            dtlsState === 'closed';

        if (isDisconnected) {
            // Даем время на восстановление (10 секунд)
            const timeoutId = setTimeout(() => {
                this.handleTransportDisconnection(roomId, peerId, transportId);
                this.disconnectionTimeouts.delete(transportId);
            }, 10000);

            this.disconnectionTimeouts.set(transportId, timeoutId);
        } else if (iceState === 'connected' && dtlsState === 'connected') {
            this.logger.log(`Transport ${transportId} (peer ${peerId}) reconnected`);
        }
    }

    private removeTransportFromRoom(roomId: string, peerId: string, transportId: string): void {
        const room = this.roomService.getRoom(roomId);
        if (!room) {
            return;
        }

        const peer = room.peers.get(peerId);
        if (!peer) {
            return;
        }


        peer.transports.delete(transportId);

        // Проверяем, есть ли у peer еще активные транспорты
        let hasActiveTransport = false;
        for (const transport of peer.transports.values()) {
            if (
                !transport.closed &&
                transport.iceState === 'connected' &&
                transport.dtlsState === 'connected'
            ) {
                hasActiveTransport = true;
                break;
            }
        }

        // Если нет активных транспортов - удаляем peer полностью
        if (!hasActiveTransport && peer.transports.size === 0) {
            this.logger.log(`Peer ${peerId} has no transports, removing from room ${roomId}`);
            this.roomService.removePeerFromRoom(roomId, peerId);
        }
    }

    private handleTransportDisconnection(roomId: string, peerId: string, transportId: string): void {
        const room = this.roomService.getRoom(roomId);
        if (!room) {
            return;
        }

        const peer = room.peers.get(peerId);
        if (!peer) {
            return;
        }

        const transport = peer.transports.get(transportId);
        if (!transport || transport.closed) {
            return;
        }

        // Проверяем текущее состояние - если все еще disconnected/failed, закрываем
        const iceState = transport.iceState;
        const dtlsState = transport.dtlsState;
        const isStillDisconnected =
            iceState === 'disconnected' ||
            iceState === 'closed' ||
            dtlsState === 'failed' ||
            dtlsState === 'closed';

        if (isStillDisconnected) {
            this.logger.warn(
                `Transport ${transportId} (peer ${peerId}) still disconnected after timeout (ICE: ${iceState}, DTLS: ${dtlsState}), closing`,
            );
            transport.close();
        }
    }
}
