import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { Room, RoomWithMap } from '@repo/types';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Room[]> {
    return this.prisma.room.findMany();
  }

  async findOne(code: string): Promise<Room | null> {
    if (!code) {
      throw new BadRequestException('Room code is required');
    }
    const room = await this.prisma.room.findUnique({
      where: { code },
    });
    if (!room) {
      throw new NotFoundException(`Room with code ${code} not found`);
    }
    return room;
  }

  async findOneWithMap(code: string): Promise<RoomWithMap | null> {
    if (!code) {
      throw new BadRequestException('Room code is required');
    }
    const room = await this.prisma.room.findUnique({
      where: { code },
      include: { map: true },
    });
    if (!room) {
      throw new NotFoundException(`Room with code ${code} not found`);
    }
    return room;
  }
}
