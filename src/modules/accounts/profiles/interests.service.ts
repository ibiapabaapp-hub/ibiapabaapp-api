import { randomUUID } from "crypto";

import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/modules/common/prisma/prisma.service";

import { CategoryInterestInputDTO } from "./dto/update-interests.dto";

@Injectable()
export class ProfileInterestsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAllByProfileId(profileId: string) {
    const interests = await this.prismaService.profile_interest.findMany({
      where: { profile_id: profileId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return interests.map((i) => ({
      id: i.category.id,
      name: i.category.name,
    }));
  }

  async upsert(
    profileId: string,
    accountId: string,
    interests: CategoryInterestInputDTO[],
  ) {
    const accountProfile = await this.prismaService.account_profile.findFirst({
      where: {
        profile_id: profileId,
        account_id: accountId,
      },
    });

    if (!accountProfile) {
      throw new NotFoundException("Profile not found");
    }

    await this.prismaService.$transaction([
      this.prismaService.profile_interest.deleteMany({
        where: { profile_id: profileId },
      }),
      this.prismaService.profile_interest.createMany({
        data: interests.map((interest) => ({
          id: randomUUID(),
          profile_id: profileId,
          category_id: interest.category_id,
        })),
      }),
    ]);

    const updatedInterests = await this.prismaService.profile_interest.findMany(
      {
        where: { profile_id: profileId },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    );

    return updatedInterests.map((i) => ({
      id: i.category.id,
      name: i.category.name,
    }));
  }
}
