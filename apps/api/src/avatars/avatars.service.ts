import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AvatarsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(category?: string) {
    if (category) {
      return this.findByCategory(category);
    }
    return this.prisma.avatar.findMany();
  }

  async findByCategory(category: string) {
    return this.prisma.avatar.findMany({
      where: {
        category: {
          equals: category,
          mode: 'insensitive',
        },
      },
    });
  }

  async getCategories() {
    const avatars = await this.prisma.avatar.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    return avatars.map((a) => a.category);
  }

  async findOne(idOrKey: string | number) {
    if (typeof idOrKey === 'number' || !isNaN(Number(idOrKey))) {
      return this.prisma.avatar.findUnique({
        where: { id: Number(idOrKey) },
      });
    }
    return this.prisma.avatar.findUnique({
      where: { key: idOrKey },
    });
  }
}
