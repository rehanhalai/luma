import { Controller, Get, Param } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import type { Room, Map } from '@repo/types';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  @Get(':code')
  findOne(@Param('code') code: string): Promise<(Room & { map: Map }) | null> {
    return this.roomsService.findOne(code);
  }
}
