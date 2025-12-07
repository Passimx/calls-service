import { ApiProperty } from '@nestjs/swagger';
import type { RtpCapabilities } from 'mediasoup/node/lib/rtpParametersTypes';

export class RoomResponseDto {
    @ApiProperty({ description: 'ID комнаты' })
    readonly roomId!: string;

    @ApiProperty({ description: 'RTP capabilities роутера' })
    readonly routerRtpCapabilities!: RtpCapabilities;
}

