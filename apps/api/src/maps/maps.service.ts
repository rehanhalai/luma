import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { Map } from '@repo/types';

@Injectable()
export class MapsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: number): Promise<Map> {
    const map = await this.prisma.map.findUnique({
      where: { id },
    });

    if (!map) {
      throw new NotFoundException(`Map with ID ${id} not found`);
    }

    return map;
  }
}
