import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateTransportDto {
    @ApiProperty({ description: 'ID peer' })
    @IsString()
    @IsNotEmpty()
    readonly peerId!: string;

    @ApiProperty({ description: 'Направление транспорта', enum: ['send', 'recv'] })
    @IsEnum(['send', 'recv'])
    @IsNotEmpty()
    readonly direction!: 'send' | 'recv';
}

