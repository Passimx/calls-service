import { Injectable, Logger } from '@nestjs/common';
import { MediasoupService } from './mediasoup.service';
import { mediaCodecs } from '../media.config';
import { Room } from './types/room.interface';
import { QueueService } from '../../queue/queue.service';
import { TopicsEnum } from '../../queue/type/topics.enum';
import { DataResponse } from '../../queue/dto/data-response.dto';

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
            return this.rooms.get(roomId)!;
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

        // Отправляем событие в Kafka о начале видеозвонка
        if (initiatorId) {
            this.sendVideoCallEvent(TopicsEnum.VIDEO_CALL_STARTED, {
                roomId,
                initiatorId,
                timestamp: new Date().toISOString(),
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

    public getRoomProducers(roomId: string, excludePeerId?: string): Array<{ peerId: string; producerId: string; kind: string }> {
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
            this.sendVideoCallEvent(TopicsEnum.VIDEO_CALL_ENDED, {
                roomId,
                timestamp: new Date().toISOString(),
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
            this.sendVideoCallEvent(TopicsEnum.VIDEO_CALL_JOINED, {
                roomId,
                peerId,
                timestamp: new Date().toISOString(),
            });
        }
    }

    public removePeerFromRoom(roomId: string, peerId: string) {
        const room = this.rooms.get(roomId);
        if (room && room.peers.has(peerId)) {
            room.peers.delete(peerId);

            // Отправляем событие в Kafka о выходе участника
            this.sendVideoCallEvent(TopicsEnum.VIDEO_CALL_LEFT, {
                roomId,
                peerId,
                timestamp: new Date().toISOString(),
            });
        }
    }

    private sendVideoCallEvent(topic: TopicsEnum, data: Record<string, unknown>): void {
        try {
            const message: DataResponse<Record<string, unknown>> = {
                data,
                success: true,
            };
            this.queueService.sendMessage(topic, message);
            this.logger.log(`Video call event sent: ${topic} for room ${data.roomId}`);
        } catch (error) {
            this.logger.error(`Failed to send video call event ${topic}: ${error.message}`);
        }
    }
}
