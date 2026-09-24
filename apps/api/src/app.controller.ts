import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Player } from 'db/schema';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): Promise<Player[]> {
    return this.appService.getHello();
  }

  @Get('add-player')
  addPlayer(): Promise<Player> {
    return this.appService.addPlayer();
  }
}
