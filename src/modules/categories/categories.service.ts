import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}
  create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async findParents() {
    return this.prisma.category.findMany({
      where: {
        parent_id: null,
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            city: true,
            company_category: true,
            event_category: true,
            // Adicionamos a contagem de filhos para o Flutter saber se deve mostrar uma seta/ícone
            children: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findChildren(parentId: string) {
    return this.prisma.category.findMany({
      where: {
        parent_id: parentId,
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            city: true,
            company_category: true,
            event_category: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException();
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);
    return await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.prisma.category.delete({
      where: { id },
    });
  }
}
