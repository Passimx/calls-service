import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';
import type { RtpParameters } from 'mediasoup/node/lib/rtpParametersTypes';

export class CreateProducerDto {
    @ApiProperty({ description: 'ID комнаты' })
    @IsString()
    @IsNotEmpty()
    readonly roomId!: string;

    @ApiProperty({ description: 'ID peer' })
    @IsString()
    @IsNotEmpty()
    readonly peerId!: string;

    @ApiProperty({ description: 'ID транспорта' })
    @IsString()
    @IsNotEmpty()
    readonly transportId!: string;

    @ApiProperty({ description: 'Тип медиа', enum: ['audio', 'video'] })
    @IsEnum(['audio', 'video'])
    @IsNotEmpty()
    readonly kind!: 'audio' | 'video';

    @ApiProperty({ description: 'RTP параметры' })
    @IsObject()
    @IsNotEmpty()
    readonly rtpParameters!: RtpParameters;
}

