import { Module } from '@nestjs/common';
import { QueueModule } from './queue/queue.module';
import { MediasoupModule } from './mediasoup/mediasoup.module';

@Module({
    imports: [QueueModule, MediasoupModule],
})
export class AppModule {}
