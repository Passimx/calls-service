import { Module } from '@nestjs/common';
import { MediasoupService } from './mediasoup.service';
import { MediaController } from './media.controller';

@Module({
    providers: [MediasoupService],
    controllers: [MediaController],
    exports: [MediasoupService],
})
export class MediasoupModule {}

