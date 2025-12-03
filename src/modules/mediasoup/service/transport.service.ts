import { Injectable, Logger } from '@nestjs/common';
import type { WebRtcTransport, DtlsParameters } from 'mediasoup/node/lib/WebRtcTransportTypes';
import { webRtcTransport_options } from '../media.config';
import { RoomService } from './room.service';
import { TransportOptions } from './types/transport.type';

@Injectable()
export class TransportService {
    private readonly logger = new Logger(TransportService.name);

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
}
