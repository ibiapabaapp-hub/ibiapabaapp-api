import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Injectable()
export class LeadsService {
	constructor(private readonly prismaService: PrismaService) {}

	async create(createLeadDto: CreateLeadDto) {
		const { name, email, phone_number, type, business_name } = createLeadDto;

		const lead = await this.prismaService.lead.findFirst({
			where: { email },
		});

		if (lead) {
			throw new BadRequestException('Lead already exists');
		}

		return await this.prismaService.lead.create({
			data: {
				name,
				email,
				phone_number,
				type,
				business_name,
			},
		});
	}

	async findAll() {
		return await this.prismaService.lead.findMany();
	}

	async findOne(id: string) {
		const lead = await this.prismaService.lead.findFirst({
			where: { id },
		});

		if (!lead) {
			throw new NotFoundException('Lead does not exist');
		}

		return lead;
	}

	async update(id: string, updateLeadDto: UpdateLeadDto) {
		await this.findOne(id);

		return await this.prismaService.lead.update({
			where: { id },
			data: updateLeadDto,
		});
	}

	async remove(id: string) {
		await this.findOne(id);

		await this.prismaService.lead.delete({
			where: { id },
		});

		return { message: 'Lead deleted successfully' };
	}
}
