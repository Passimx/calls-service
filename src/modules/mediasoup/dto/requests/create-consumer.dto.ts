import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import type { RtpCapabilities } from 'mediasoup/node/lib/rtpParametersTypes';

export class CreateConsumerDto {
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

    @ApiProperty({ description: 'ID producer' })
    @IsString()
    @IsNotEmpty()
    readonly producerId!: string;

    @ApiProperty({ description: 'RTP capabilities' })
    @IsObject()
    @IsNotEmpty()
    readonly rtpCapabilities!: RtpCapabilities;
}

