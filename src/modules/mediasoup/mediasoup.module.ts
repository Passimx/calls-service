import { Module } from '@nestjs/common';
import { MediasoupService } from './service/mediasoup.service';
import { RoomService } from './service/room.service';
import { TransportService } from './service/transport.service';
import { ProducerConsumerService } from './service/producer-consumer.service';
import { MediaController } from './controller/media.controller';
import { QueueModule } from '../queue/queue.module';

@Module({
    imports: [QueueModule],
    providers: [MediasoupService, RoomService, TransportService, ProducerConsumerService],
    controllers: [MediaController],
    exports: [MediasoupService, RoomService, TransportService, ProducerConsumerService],
})
export class MediasoupModule {}
