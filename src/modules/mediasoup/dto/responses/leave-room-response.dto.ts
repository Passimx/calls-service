import { ApiProperty } from '@nestjs/swagger';

export class LeaveRoomResponseDto {
    @ApiProperty({ description: 'Успешность операции' })
    readonly success!: boolean;

    @ApiProperty({ description: 'Сообщение' })
    readonly message!: string;
}
