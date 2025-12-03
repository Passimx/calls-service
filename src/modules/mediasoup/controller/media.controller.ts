import { Controller, Post, Get, Body, Param, HttpException, HttpStatus, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { DtlsParameters } from 'mediasoup/node/lib/WebRtcTransportTypes';
import { RoomService } from '../service/room.service';
import { TransportService } from '../service/transport.service';
import { ProducerConsumerService } from '../service/producer-consumer.service';
import { ProduceParams, ConsumeParams } from '../service/types/producer-consumer.type';

@ApiTags('Media')
@Controller('media')
export class MediaController {
    constructor(
        private readonly roomService: RoomService,
        private readonly transportService: TransportService,
        private readonly producerConsumerService: ProducerConsumerService,
    ) {}

    @Post('room')
    async createOrGetRoom(@Body() body: { roomId: string; initiatorId?: string }) {
        if (!body.roomId) {
            throw new HttpException('roomId is required', HttpStatus.BAD_REQUEST);
        }

        const room = await this.roomService.createRoom(body.roomId, body.initiatorId);

        return {
            roomId: room.id,
            routerRtpCapabilities: room.router.rtpCapabilities,
        };
    }

    @Post('transport/:roomId')
    async createTransport(
        @Param('roomId') roomId: string,
        @Body() body: { peerId: string; direction: 'send' | 'recv' },
    ) {
        return await this.transportService.createWebRtcTransport(roomId, body.peerId, body.direction);
    }

    @Post('transport/:transportId/connect')
    async connectTransport(
        @Param('transportId') transportId: string,
        @Body() body: { dtlsParameters: DtlsParameters },
    ) {
        if (!body.dtlsParameters) {
            throw new HttpException('dtlsParameters is required', HttpStatus.BAD_REQUEST);
        }
        await this.transportService.connectTransport(transportId, body.dtlsParameters);
        return { success: true };
    }

    @Post('producer')
    async createProducer(@Body() body: ProduceParams) {
        const producerId = await this.producerConsumerService.createProducer(body);
        return { producerId };
    }

    @Post('consumer')
    async createConsumer(@Body() body: ConsumeParams) {
        return await this.producerConsumerService.createConsumer(body);
    }

    @Get('room/:roomId/producers')
    async getRoomProducers(@Param('roomId') roomId: string, @Query('excludePeerId') excludePeerId?: string) {
        const producers = this.roomService.getRoomProducers(roomId, excludePeerId);
        return { producers };
    }
}
