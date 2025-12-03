import { Injectable, Logger } from '@nestjs/common';
import type { Consumer } from 'mediasoup/node/lib/ConsumerTypes';
import type { Producer } from 'mediasoup/node/lib/ProducerTypes';
import type { RtpParameters } from 'mediasoup/node/lib/rtpParametersTypes';
import { RoomService } from './room.service';
import { ConsumeParams, ProduceParams } from './types/producer-consumer.type';

@Injectable()
export class ProducerConsumerService {
    private readonly logger = new Logger(ProducerConsumerService.name);

    constructor(private readonly roomService: RoomService) {}

    public async createProducer(params: ProduceParams): Promise<string> {
        const { roomId, peerId, kind, rtpParameters, transportId } = params;
        const room = this.roomService.getRoom(roomId);
        if (!room) {
            throw new Error(`Room ${roomId} not found`);
        }

        const peer = room.peers.get(peerId);
        if (!peer) {
            throw new Error(`Peer ${peerId} not found`);
        }
        const transport = peer.transports.get(transportId);
        if (!transport) {
            throw new Error('Transport not found');
        }

        if (transport.closed) {
            throw new Error('Transport is closed');
        }

        const producer = await transport.produce({
            kind,
            rtpParameters,
        });

        peer.producers.set(producer.id, producer);

        this.logger.log(`Producer ${producer.id} created for peer ${peerId} (${kind})`);

        return producer.id;
    }

    public async createConsumer(params: ConsumeParams): Promise<{
        id: string;
        producerId: string;
        kind: string;
        rtpParameters: RtpParameters;
    }> {
        const { roomId, peerId, producerId, rtpCapabilities, transportId } = params;
        const room = this.roomService.getRoom(roomId);

        if (!room) {
            throw new Error(`Room ${roomId} not found`);
        }

        // Проверяем существование Producer
        const producer = this.findProducerById(roomId, producerId);
        if (!producer) {
            throw new Error(`Producer ${producerId} not found`);
        }

        if (producer.closed) {
            throw new Error(`Producer ${producerId} is closed`);
        }

        if (!room.router.canConsume({ producerId, rtpCapabilities })) {
            throw new Error(`Cannot consume producer ${producerId}`);
        }

        const peer = room.peers.get(peerId);
        if (!peer) {
            throw new Error(`Peer ${peerId} not found`);
        }

        const transport = peer.transports.get(transportId);
        if (!transport) {
            throw new Error('Transport not found');
        }

        if (transport.closed) {
            throw new Error('Transport is closed');
        }

        const consumer: Consumer = await transport.consume({
            producerId,
            rtpCapabilities,
            paused: false,
        });

        peer.consumers.set(consumer.id, consumer);

        this.logger.log(`Consumer ${consumer.id} created for peer ${peerId}`);

        return {
            id: consumer.id,
            producerId,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
        };
    }

    private findProducerById(roomId: string, producerId: string): Producer | null {
        const room = this.roomService.getRoom(roomId);
        if (!room) {
            return null;
        }

        // Проходим по всем Peer'ам в комнате и ищем Producer
        for (const peer of room.peers.values()) {
            const producer = peer.producers.get(producerId);
            if (producer) {
                return producer;
            }
        }

        return null;
    }
}
