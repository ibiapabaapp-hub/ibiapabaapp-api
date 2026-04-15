import { Injectable, NotFoundException } from "@nestjs/common";
import { instanceToPlain } from "class-transformer";
import { PrismaService } from "src/modules/common/prisma/prisma.service";

import { CreateBusinessDTO } from "./dto/create-business.dto";
import { UpdateBusinessDTO } from "./dto/update-business.dto";
import { BusinessResponseDTO } from "./dto/business-response-dto";

@Injectable()
export class BusinessesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateBusinessDTO) {
    return await this.prismaService.business.create({
      data: dto,
    });
  }

  async findAll() {
    const businesses = await this.prismaService.business.findMany({
      select: {
        id: true,
        created_at: true,
        max_reach_level: true,
        profile: {
          select: {
            bio: true,
            slug: true,
            display_name: true,
            avatar_url: true,
            created_at: true,
          },
        },
        categories: {
          select: {
            category: { select: { name: true } },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return businesses.map((b) => instanceToPlain(new BusinessResponseDTO(b)));
  }

  async findOne(id: string) {
    const business = await this.prismaService.business.findUnique({
      where: { id },
      select: {
        id: true,
        created_at: true,
        max_reach_level: true,
        profile: {
          select: {
            bio: true,
            slug: true,
            display_name: true,
            avatar_url: true,
            created_at: true,
          },
        },
        categories: {
          select: {
            category: { select: { name: true } },
          },
        },
      },
    });

    if (!business) {
      throw new NotFoundException();
    }

    return instanceToPlain(new BusinessResponseDTO(business));
  }

  async update(id: string, dto: UpdateBusinessDTO) {
    return await this.prismaService.business.update({
      data: {
        cnpj: dto.cnpj,
        max_reach_level: dto.max_reach_level,
      },
      where: { id },
    });
  }

  async remove(id: string) {
    return await this.prismaService.business.delete({ where: { id } });
  }
}
