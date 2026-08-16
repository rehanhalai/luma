import { Module } from '@nestjs/common';

import { LinksModule } from './links/links.module';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { GameGateway } from './game/game.gateway';

@Module({
  imports: [LinksModule],
  controllers: [AppController],
  providers: [AppService, GameGateway],
})
export class AppModule {}
