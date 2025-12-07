import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoomDto {
    @ApiProperty({ description: 'ID комнаты' })
    @IsString()
    @IsNotEmpty()
    readonly roomId!: string;

    @ApiProperty({ description: 'ID инициатора звонка', required: false })
    @IsString()
    @IsOptional()
    readonly initiatorId?: string;
}

