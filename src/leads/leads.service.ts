import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class LeadsService {
  constructor(private prismaService: PrismaService) {}

  async create(createLeadDto: CreateLeadDto) {
    const { name, email, phone_number, type, company_name } = createLeadDto;
    return await this.prismaService.leads.create({
      data: {
        name,
        email,
        phone_number,
        type,
        company_name,
      },
    });
  }

  async findAll() {
    return await this.prismaService.leads.findMany();
  }

  async findOne(id: string) {
    const lead = await this.prismaService.leads.findFirst({
      where: { id },
    });

    if (!lead) {
      throw new NotFoundException('Lead does not exist');
    }

    return lead;
  }

  async update(id: string, updateLeadDto: UpdateLeadDto) {
    const { name, email, phone_number, type, company_name } = updateLeadDto;

    const updated = await this.prismaService.leads.updateMany({
      where: { id },
      data: { name, email, phone_number, type, company_name },
    });

    if (updated.count === 0) {
      throw new NotFoundException('Lead does not exist');
    }

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.prismaService.leads.deleteMany({
      where: { id },
    });

    if (deleted.count === 0) {
      throw new NotFoundException('Lead does not exist');
    }

    return deleted;
  }
}
