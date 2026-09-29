import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { player as playerModel } from './generated/prisma/client';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): Promise<playerModel[]> {
    return this.appService.getPlayers();
  }
}
