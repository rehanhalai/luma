import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Player, player, NewPlayer } from 'db/schema';

@Injectable()
export class AppService {
  constructor(
    @InjectDrizzle()
    private readonly db: NodePgDatabase,
  ) {}

  async addPlayer(): Promise<Player> {
    const [newPlayer] = await this.db
      .insert(player)
      .values({
        name: 'John Doe',
      })
      .returning();
    if (!newPlayer) {
      throw new InternalServerErrorException('failed to create player');
    }
    return newPlayer;
  }

  async getHello(): Promise<Player[]> {
    const players = await this.db.select().from(player);
    return players;
  }
}
