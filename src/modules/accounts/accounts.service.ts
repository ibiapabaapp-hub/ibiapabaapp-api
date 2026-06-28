import { randomUUID } from 'crypto';

import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { PaginationDto } from 'src/modules/common/dtos/pagination.dto';
import { hashPassword } from 'src/modules/common/password/password.util';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { account } from '@prisma/client';

import { CreateAccountDTO } from './dtos/create-account.dto';
import { SecureAccountDTO } from './dtos/secure-account-dto';
import { UpdateAccountDTO } from './dtos/update-account.dto';

@Injectable()
export class AccountsService {
	constructor(private readonly prismaService: PrismaService) {}

	async create(data: CreateAccountDTO) {
		const account = await this.prismaService.account.create({
			data: {
				id: randomUUID(),
				name: data.name,
				// birth_date: data.birth_date,
				email: data.email.trim(),
				password: await hashPassword(data.password),
				phone_number: data.phone_number,
				// Profile fields
				slug: data.slug,
				display_name: data.display_name,
				bio: data.bio,
				avatar_url: data.avatar_url,
				type: data.type || 'personal',
			},
			omit: { password: true },
		});

		return account;
	}

	// TODO: escrever teste unitário de verifyAccount -> accounts.service
	async verifyAccount(id: string) {
		try {
			return await this.prismaService.account.update({
				where: { id },
				data: { is_verified: true },
			});
		} catch {
			throw new BadRequestException({
				message: 'Account already verified',
				code: 'account_already_verified',
			});
		}
	}

	async findAll(paginationQuery: PaginationDto) {
		const { limit = 10, offset } = paginationQuery;
		return await this.prismaService.account.findMany({
			take: limit,
			skip: offset,
			omit: { password: true },
		});
	}

	async findOneInDetailById(id: string) {
		const account = await this.prismaService.account.findFirst({
			where: { id },
			include: {
				interests: {
					select: {
						category: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
			},
			omit: { password: true },
		});

		if (!account) {
			throw new NotFoundException('User not found');
		}

		return new SecureAccountDTO(account);
	}

	async findOneById(id: string) {
		const account = await this.prismaService.account.findFirst({
			where: { id },
			omit: { password: true },
		});

		if (!account) {
			throw new NotFoundException('User not found');
		}

		return new SecureAccountDTO(account);
	}

	async findOneByEmail(email: string, getPassword: boolean = false) {
		const account = await this.prismaService.account.findFirst({
			where: { email },
			omit: { password: !getPassword },
		});

		if (!account) {
			throw new NotFoundException('User not found');
		}

		return account;
	}

	async update(id: string, updateUserDto: UpdateAccountDTO) {
		const accountExists = await this.prismaService.account.findUnique({
			where: { id },
		});

		if (!accountExists) {
			throw new NotFoundException('User not found');
		}

		if (!updateUserDto.password) {
			throw new BadRequestException('Current password is required for updates');
		}

		const { password, ...rest } = updateUserDto;

		const dataToUpdate: Partial<account> = {
			...rest,
			updated_at: new Date(),
		};

		if (password) {
			dataToUpdate.password = await hashPassword(password);
		}

		return this.prismaService.account.update({
			where: { id },
			data: dataToUpdate,
			omit: { password: true },
		});
	}

	async remove(id: string) {
		const account = await this.prismaService.account.findFirst({
			where: { id },
			omit: { password: true },
		});

		if (!account) {
			throw new NotFoundException('User not found');
		}

		await this.prismaService.account.delete({ where: { id } });
		return account;
	}
}
