import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import type { Room, RoomWithMap, CreateRoomDto } from '@repo/types';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Room[]> {
    return this.prisma.room.findMany({
      where: { isPrivate: false },
    });
  }

  async createPrivateRoom(dto?: CreateRoomDto): Promise<Room> {
    let code = '';
    let isUnique = false;

    while (!isUnique) {
      code = randomBytes(3).toString('hex').toUpperCase();
      const existing = await this.prisma.room.findUnique({
        where: { code },
      });
      if (!existing) {
        isUnique = true;
      }
    }

    const defaultMap = await this.prisma.map.findFirst();
    const mapId = defaultMap ? defaultMap.id : 1;

    return this.prisma.room.create({
      data: {
        code,
        name: dto?.name?.trim() || 'Private Room',
        isPrivate: true,
        maxCapacity: dto?.maxCapacity || 10,
        mapId,
      },
    });
  }

  async deleteRoom(code: string): Promise<void> {
    if (!code) return;
    try {
      await this.prisma.room.deleteMany({
        where: { code, isPrivate: true },
      });
    } catch {
      // Room may already have been removed
    }
  }

  async findOne(code: string): Promise<Room> {
    if (!code) {
      throw new BadRequestException('Room code is required');
    }

    const room = await this.prisma.room.findUnique({
      where: { code },
    });

    if (!room) {
      throw new NotFoundException(`Room with code "${code}" not found`);
    }

    return room;
  }

  async findOneWithMap(code: string): Promise<RoomWithMap> {
    if (!code) {
      throw new BadRequestException('Room code is required');
    }

    const room = await this.prisma.room.findUnique({
      where: { code },
      include: { map: true },
    });

    if (!room) {
      throw new NotFoundException(`Room with code "${code}" not found`);
    }

    return room;
  }
}
