import { ApiProperty } from '@nestjs/swagger';

export class ProducerResponseDto {
    @ApiProperty({ description: 'ID producer' })
    readonly producerId!: string;
}

