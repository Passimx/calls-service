import { Injectable, Logger } from '@nestjs/common';
import { mediaCodecs } from '../media.config';
import { QueueService } from '../../queue/queue.service';
import { TopicsEnum } from '../../queue/type/topics.enum';
import { MessageDto } from '../../queue/dto/message.dto';
import { DataResponse } from '../../queue/dto/data-response.dto';
import { EventsEnum } from '../../queue/type/events.enum';
import { Room } from './types/room.interface';
import { MediasoupService } from './mediasoup.service';

@Injectable()
export class RoomService {
    private readonly logger = new Logger(RoomService.name);
    private rooms: Map<string, Room> = new Map();

    constructor(
        private readonly mediasoupService: MediasoupService,
        private readonly queueService: QueueService,
    ) {}

    public async createRoom(roomId: string, initiatorId?: string): Promise<Room> {
        if (this.rooms.has(roomId)) {
            return this.rooms.get(roomId);
        }

        const worker = this.mediasoupService.getWorker();
        const router = await worker.createRouter({ mediaCodecs });
        const newRoom: Room = {
            id: roomId,
            router,
            peers: new Map(),
        };
        this.rooms.set(roomId, newRoom);

        this.logger.log(`Router created for room ${roomId}`);

        // Отправляем уведомление в чат - все участники чата получат уведомление
        if (initiatorId) {
            this.sendVideoCallEvent(TopicsEnum.EMIT_TO_CHAT, roomId, EventsEnum.VIDEO_CALL_STARTED, {
                roomId,
                initiatorId,
            });
        }

        return newRoom;
    }

    public getRoom(roomId: string): Room | undefined {
        return this.rooms.get(roomId);
    }

    public getAllRooms(): Map<string, Room> {
        return this.rooms;
    }

    public getRoomProducers(
        roomId: string,
        excludePeerId?: string,
    ): Array<{ peerId: string; producerId: string; kind: string }> {
        const room = this.rooms.get(roomId);
        if (!room) {
            return [];
        }

        const producers: Array<{ peerId: string; producerId: string; kind: string }> = [];

        for (const [peerId, peer] of room.peers.entries()) {
            if (excludePeerId && peerId === excludePeerId) {
                continue;
            }

            for (const [producerId, producer] of peer.producers.entries()) {
                if (!producer.closed) {
                    producers.push({
                        peerId,
                        producerId,
                        kind: producer.kind,
                    });
                }
            }
        }

        return producers;
    }

    public removeRoom(roomId: string): void {
        const room = this.rooms.get(roomId);
        if (room) {
            room.router.close();
            this.rooms.delete(roomId);
            this.logger.log(`Room ${roomId} removed`);

            // Отправляем событие в Kafka о завершении видеозвонка
            this.sendVideoCallEvent(TopicsEnum.EMIT_TO_CHAT, roomId, EventsEnum.VIDEO_CALL_ENDED, {
                roomId,
            });
        }
    }

    public addPeerToRoom(roomId: string, peerId: string) {
        const room = this.rooms.get(roomId);
        if (!room) {
            throw new Error(`Room ${roomId} not found`);
        }

        const isNewPeer = !room.peers.has(peerId);

        if (isNewPeer) {
            room.peers.set(peerId, {
                id: peerId,
                transports: new Map(),
                producers: new Map(),
                consumers: new Map(),
            });

            // Отправляем событие в Kafka о присоединении участника
            this.sendVideoCallEvent(TopicsEnum.EMIT_TO_CHAT, roomId, EventsEnum.VIDEO_CALL_JOINED, {
                roomId,
                peerId,
            });
        }
    }

    private closeAll(items: Iterable<{ close: () => void }>) {
        for (const item of items) {
            item.close();
        }
    }

    public removePeerFromRoom(roomId: string, peerId: string): boolean {
        const room = this.rooms.get(roomId);
        if (!room) {
            this.logger.warn(`Room ${roomId} not found when trying to remove peer ${peerId}`);
            return false;
        }

        const peer = room.peers.get(peerId);
        if (!peer) {
            this.logger.warn(`Peer ${peerId} not found in room ${roomId}`);
            return false;
        }

        this.logger.log(`Removing peer ${peerId} from room ${roomId}`);

        this.closeAll(peer.consumers.values());
        this.closeAll(peer.producers.values());
        this.closeAll(peer.transports.values());

        room.peers.delete(peerId);
        this.logger.log(`Peer ${peerId} removed from room ${roomId}. Remaining peers: ${room.peers.size}`);

        // Отправляем событие в Kafka о выходе участника
        this.sendVideoCallEvent(TopicsEnum.EMIT_TO_CHAT, roomId, EventsEnum.VIDEO_CALL_LEFT, {
            roomId,
            peerId,
        });

        if (room.peers.size === 0) {
            this.removeRoom(roomId);
        }

        return true;
    }

    private sendVideoCallEvent(topic: TopicsEnum, chatId: string, event: string, data: Record<string, unknown>): void {
        try {
            const dataResponse = new DataResponse<Record<string, unknown>>(data, true);
            const message = new MessageDto(chatId, event, dataResponse);

            this.queueService.sendMessage(topic, message);
            this.logger.log(`Video call event sent: ${event} to chat ${chatId} for room ${String(data.roomId)}`);
        } catch (error) {
            this.logger.error(`Failed to send video call event ${event} to chat ${chatId}: ${error.message}`);
        }
    }
}
