import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import type { CreateRoomDto, Room } from '@repo/types';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  findAll(): Promise<Room[]> {
    return this.roomsService.findAll();
  }

  @Post()
  createPrivateRoom(@Body() dto: CreateRoomDto): Promise<Room> {
    return this.roomsService.createPrivateRoom(dto);
  }

  @Get(':code')
  findOne(@Param('code') code: string): Promise<Room> {
    return this.roomsService.findOne(code);
  }
}
