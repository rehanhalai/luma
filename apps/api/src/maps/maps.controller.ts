import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { MapsService } from './maps.service';
import type { Map } from '@repo/types';

@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Map> {
    return this.mapsService.findOne(id);
  }
}
