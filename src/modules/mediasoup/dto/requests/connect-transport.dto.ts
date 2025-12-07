import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject } from 'class-validator';
import type { DtlsParameters } from 'mediasoup/node/lib/WebRtcTransportTypes';

export class ConnectTransportDto {
    @ApiProperty({ description: 'DTLS параметры для подключения транспорта' })
    @IsObject()
    @IsNotEmpty()
    readonly dtlsParameters!: DtlsParameters;
}
