import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const rooms = await this.prisma.room.findMany();
    return rooms;
  }

  async findOne(code: string) {
    const room = await this.prisma.room.findUnique({
      where: { code },
      include: { map: true },
    });
    return room;
  }
}
