import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const rooms = await this.prisma.room.findMany();
    return rooms;
  }

  findOne(code: string) {
    return `This action returns room with code #${code}`;
  }
}
