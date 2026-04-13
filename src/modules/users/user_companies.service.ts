import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { $Enums } from '@prisma/client';
import { AddUserToCompanyDto } from './dtos/add-user-to-company.dto';
import { RemoveUserFromCompanyDto } from './dtos/remove-user-from-company.dto';

@Injectable()
export class UserCompaniesService {
	constructor(private prisma: PrismaService) {}

	async addUserToCompany(dto: AddUserToCompanyDto) {
		return await this.prisma.user_company.create({ data: dto });
	}

	async listUserCompanies(userId: string) {
		return await this.prisma.user_company.findMany({
			where: { user_id: userId },
		});
	}

	async removeUserFromCompany(dto: RemoveUserFromCompanyDto) {
		return await this.prisma.user_company.delete({
			where: { user_id_company_id: dto },
		});
	}
}
