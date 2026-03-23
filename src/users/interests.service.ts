import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { UserInterest } from './entities/user_interest.entity';

@Injectable()
export class InterestsService {
  constructor(private prisma: PrismaService) {}

  async addInterests(
    userId: string,
    categoryIds: string[],
  ): Promise<{ count: number }> {
    return await this.prisma.user_interest.createMany({
      data: categoryIds.map((category_id) => ({
        user_id: userId,
        category_id,
      })),
      skipDuplicates: true, // ignora interesse se ja existir
    });
  }

  async updateInterests(
    userId: string,
    categoryIds: string[],
  ): Promise<{ count: number }> {
    return await this.prisma.user_interest.updateMany({
      data: categoryIds.map((category_id) => ({
        user_id: userId,
        category_id,
      })),
    });
  }

  async listInterests(userId: string): Promise<UserInterest[]> {
    return this.prisma.user_interest.findMany({
      where: { user_id: userId },
      include: { category: true },
    });
  }
}
