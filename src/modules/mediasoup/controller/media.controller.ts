import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RoomService } from '../service/room.service';
import { TransportService } from '../service/transport.service';
import { ProducerConsumerService } from '../service/producer-consumer.service';
import { ApiData } from '../../../common/swagger/api-data.decorator';
import { CreateRoomDto } from '../dto/requests/create-room.dto';
import { CreateTransportDto } from '../dto/requests/create-transport.dto';
import { ConnectTransportDto } from '../dto/requests/connect-transport.dto';
import { CreateProducerDto } from '../dto/requests/create-producer.dto';
import { CreateConsumerDto } from '../dto/requests/create-consumer.dto';
import { RoomResponseDto } from '../dto/responses/room-response.dto';
import { TransportResponseDto } from '../dto/responses/transport-response.dto';
import { ProducerResponseDto } from '../dto/responses/producer-response.dto';
import { ConsumerResponseDto } from '../dto/responses/consumer-response.dto';
import { ProducersListResponseDto } from '../dto/responses/producers-list-response.dto';
import { LeaveRoomResponseDto } from '../dto/responses/leave-room-response.dto';

@ApiTags('Media')
@Controller('media')
export class MediaController {
    constructor(
        private readonly roomService: RoomService,
        private readonly transportService: TransportService,
        private readonly producerConsumerService: ProducerConsumerService,
    ) {}

    @Post('room')
    @ApiOperation({ summary: 'Создать или получить комнату' })
    @ApiData(RoomResponseDto)
    async createOrGetRoom(@Body() body: CreateRoomDto): Promise<RoomResponseDto> {
        const room = await this.roomService.createRoom(body.roomId, body.initiatorId);

        return {
            roomId: room.id,
            routerRtpCapabilities: room.router.rtpCapabilities,
        };
    }

    @Post('transport/:roomId')
    @ApiOperation({ summary: 'Создать WebRTC транспорт' })
    @ApiParam({ name: 'roomId', description: 'ID комнаты' })
    @ApiData(TransportResponseDto)
    async createTransport(
        @Param('roomId') roomId: string,
        @Body() body: CreateTransportDto,
    ): Promise<TransportResponseDto> {
        return await this.transportService.createWebRtcTransport(roomId, body.peerId, body.direction);
    }

    @Post('transport/:transportId/connect')
    @ApiOperation({ summary: 'Подключить транспорт' })
    @ApiParam({ name: 'transportId', description: 'ID транспорта' })
    @ApiData(LeaveRoomResponseDto)
    async connectTransport(
        @Param('transportId') transportId: string,
        @Body() body: ConnectTransportDto,
    ): Promise<{ success: boolean }> {
        await this.transportService.connectTransport(transportId, body.dtlsParameters);
        return { success: true };
    }

    @Post('producer')
    @ApiOperation({ summary: 'Создать producer' })
    @ApiData(ProducerResponseDto)
    async createProducer(@Body() body: CreateProducerDto): Promise<ProducerResponseDto> {
        const producerId = await this.producerConsumerService.createProducer(body);
        return { producerId };
    }

    @Post('consumer')
    @ApiOperation({ summary: 'Создать consumer' })
    @ApiData(ConsumerResponseDto)
    async createConsumer(@Body() body: CreateConsumerDto) {
        return await this.producerConsumerService.createConsumer(body);
    }

    @Get('room/:roomId/producers')
    @ApiOperation({ summary: 'Получить список producers' })
    @ApiParam({ name: 'roomId', description: 'ID комнаты' })
    @ApiQuery({ name: 'excludePeerId', required: false, description: 'ID peer для исключения из списка' })
    @ApiData(ProducersListResponseDto)
    getRoomProducers(@Param('roomId') roomId: string, @Query('excludePeerId') excludePeerId?: string) {
        const producers = this.roomService.getRoomProducers(roomId, excludePeerId);
        return { producers };
    }

    @Post('room/:roomId/leave')
    @ApiOperation({ summary: 'Выйти из комнаты' })
    @ApiParam({ name: 'roomId', description: 'ID комнаты' })
    @ApiData(LeaveRoomResponseDto)
    removePeerFromRooms(@Param('roomId') roomId: string, @Body('peerId') peerId: string): LeaveRoomResponseDto {
        this.roomService.removePeerFromRoom(roomId, peerId);

        return {
            success: true,
            message: `Peer ${peerId} removed from room ${roomId}`,
        };
    }
}
