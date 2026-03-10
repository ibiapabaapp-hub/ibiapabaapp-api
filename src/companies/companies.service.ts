import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto) {
    return await this.prismaService.company.create({ data: createCompanyDto });
  }

  async findAll() {
    const companies = await this.prismaService.company.findMany({
      include: {
        categories: {
          select: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return companies.map((c) => ({
      ...c,
      categories: c.categories.map((cat) => cat.category.name),
    }));
  }

  async findOne(id: string) {
    const company = await this.prismaService.company.findUnique({
      where: { id },
      include: {
        categories: {
          select: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!company) return null;

    return {
      ...company,
      categories: company.categories.map((cat) => cat.category.name),
    };
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    return await this.prismaService.company.update({
      data: {
        name: updateCompanyDto.name,
        cnpj: updateCompanyDto.cnpj,
        description: updateCompanyDto.description,
      },
      where: { id },
    });
  }

  async remove(id: string) {
    return await this.prismaService.company.delete({ where: { id } });
  }
}
