import { ApiProperty } from '@nestjs/swagger';
import type { RtpParameters } from 'mediasoup/node/lib/rtpParametersTypes';

export class ConsumerResponseDto {
    @ApiProperty({ description: 'ID consumer' })
    readonly id!: string;

    @ApiProperty({ description: 'ID producer' })
    readonly producerId!: string;

    @ApiProperty({ description: 'Тип медиа', enum: ['audio', 'video'] })
    readonly kind!: string;

    @ApiProperty({ description: 'RTP параметры' })
    readonly rtpParameters!: RtpParameters;
}
