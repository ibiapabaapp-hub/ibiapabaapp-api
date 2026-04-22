import { randomUUID } from 'crypto';

import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { PaginationDto } from 'src/modules/common/dtos/pagination.dto';
import { PasswordService } from 'src/modules/common/password/password.service';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { CreateAccountDTO } from './dtos/create-account.dto';
import {
	SecureAccountDTO,
	SecureAccountWithProfilesDTO,
} from './dtos/secure-account-dto';
import { UpdateAccountDTO } from './dtos/update-account.dto';
import { Account } from './entities/account.entity';

@Injectable()
export class AccountsService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly passwordService: PasswordService,
	) {}

	async create(data: CreateAccountDTO) {
		if (data.password !== data.password_confirm) {
			throw new BadRequestException({
				message: 'Password and password confirmation must be equal',
				code: 'password_mismatch',
			});
		}

		const account = await this.prismaService.account.create({
			data: {
				id: randomUUID(),
				name: data.name,
				// birth_date: data.birth_date,
				email: data.email.trim(),
				password: await this.passwordService.hashPassword(data.password),
				phone_number: data.phone_number,
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
				profiles: {
					select: {
						profile: {
							select: {
								id: true,
								slug: true,
								display_name: true,
								bio: true,
								avatar_url: true,
								interests: true,
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

		return new SecureAccountWithProfilesDTO(account);
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

		const isPasswordValid = await this.passwordService.verifyPassword(
			accountExists.password,
			updateUserDto.password,
		);

		if (!isPasswordValid) {
			throw new UnauthorizedException('Invalid credentials');
		}

		const { password, ...rest } = updateUserDto;

		const dataToUpdate: Partial<Account> = {
			...rest,
			updated_at: new Date(),
		};

		if (password) {
			dataToUpdate.password = await this.passwordService.hashPassword(password);
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
