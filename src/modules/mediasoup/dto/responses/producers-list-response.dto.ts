import { ApiProperty } from '@nestjs/swagger';

export class ProducerInfoDto {
    @ApiProperty({ description: 'ID producer' })
    readonly producerId!: string;

    @ApiProperty({ description: 'ID peer' })
    readonly peerId!: string;

    @ApiProperty({ description: 'Тип медиа', enum: ['audio', 'video'] })
    readonly kind!: string;
}

export class ProducersListResponseDto {
    @ApiProperty({ description: 'Список producers', type: [ProducerInfoDto] })
    readonly producers!: ProducerInfoDto[];
}

