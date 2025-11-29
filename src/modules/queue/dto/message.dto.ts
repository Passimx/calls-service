import { ApiProperty } from '@nestjs/swagger';
import {  IsNotEmpty, IsObject, IsString } from 'class-validator';
import { DataResponse } from './data-response.dto';


export class MessageDto<T = unknown> {
    @IsString()
    @IsNotEmpty()
    readonly to: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()

    readonly event: string

    @ApiProperty({ type: DataResponse })
    @IsObject()
    readonly data: DataResponse<T>;

    constructor(event: string, data: DataResponse<T>) {
        this.event = event;
        this.data = data;
    }
}
