import { ApiProperty } from '@nestjs/swagger';
import type { DtlsParameters, IceCandidate, IceParameters } from 'mediasoup/node/lib/WebRtcTransportTypes';

export class TransportResponseDto {
    @ApiProperty({ description: 'ID транспорта' })
    readonly id!: string;

    @ApiProperty({ description: 'ICE параметры' })
    readonly iceParameters!: IceParameters;

    @ApiProperty({ description: 'ICE кандидаты', type: 'array' })
    readonly iceCandidates!: IceCandidate[];

    @ApiProperty({ description: 'DTLS параметры' })
    readonly dtlsParameters!: DtlsParameters;
}

