import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { hashPassword } from 'src/modules/common/password/password.util';

import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AdminService {
	constructor(private readonly prisma: PrismaService) {}

	async overview() {
		const [accounts, businesses, events, cities, leads, reviews] =
			await Promise.all([
				this.prisma.account.count(),
				this.prisma.business.count(),
				this.prisma.event.count(),
				this.prisma.city.count(),
				this.prisma.lead.count(),
				this.prisma.review.count(),
			]);
		return {
			accounts,
			businesses,
			events,
			cities,
			leads,
			reviews,
			generated_at: new Date(),
		};
	}

	private assertResource(resource: string) {
		if (
			!['accounts', 'cities', 'businesses', 'events', 'tags'].includes(resource)
		) {
			throw new BadRequestException('Unsupported admin resource');
		}
	}

	async list(resource: string) {
		this.assertResource(resource);
		if (resource === 'accounts')
			return this.prisma.account.findMany({
				omit: { password: true },
				orderBy: { created_at: 'desc' },
			});
		if (resource === 'cities')
			return this.prisma.city.findMany({
				orderBy: { name: 'asc' },
				include: { tags: { include: { tag: true } } },
			});
		if (resource === 'businesses')
			return this.prisma.business.findMany({
				orderBy: { created_at: 'desc' },
				include: { account: true, tags: { include: { tag: true } } },
			});
		if (resource === 'events')
			return this.prisma.event.findMany({
				orderBy: { created_at: 'desc' },
				include: { owner: true, tags: { include: { tag: true } } },
			});
		return this.prisma.tag.findMany({
			orderBy: [{ group: { name: 'asc' } }, { position: 'asc' }],
			include: { group: true },
		});
	}

	async create(resource: string, input: Record<string, unknown>) {
		this.assertResource(resource);
		if (resource === 'accounts') {
			const password = String(input.password ?? '');
			if (!password) throw new BadRequestException('Password is required');
			return this.prisma.account.create({
				data: {
					email: String(input.email),
					name: String(input.name ?? input.display_name),
					display_name: String(input.display_name ?? input.name),
					password: await hashPassword(password),
					phone_number: input.phone_number ? String(input.phone_number) : null,
					slug: input.slug ? String(input.slug) : null,
					type: input.type === 'business' ? 'business' : 'personal',
				},
				omit: { password: true },
			});
		}
		if (resource === 'cities')
			return this.prisma
				.$queryRaw`INSERT INTO city (name, slug, description, cover_img_url, location) VALUES (${String(input.name)}, ${String(input.slug)}, ${input.description ? String(input.description) : null}, ${input.cover_img_url ? String(input.cover_img_url) : null}, ST_SetSRID(ST_MakePoint(${Number(input.longitude ?? 0)}, ${Number(input.latitude ?? 0)}), 4326)) RETURNING id, name, slug, description, cover_img_url`;
		if (resource === 'businesses')
			return this.prisma.business.create({
				data: {
					owner_account_id: String(input.account_id),
					cnpj: input.cnpj ? String(input.cnpj) : null,
					max_reach_level:
						input.max_reach_level === 'regional' ? 'regional' : 'local',
				},
				include: { account: true },
			});
		if (resource === 'events')
			return this.prisma.event.create({
				data: {
					owner_account_id: String(input.owner_account_id),
					name: String(input.name),
					slug: String(input.slug),
					description: input.description ? String(input.description) : null,
					cover_img_url: input.cover_img_url
						? String(input.cover_img_url)
						: null,
					type: input.type === 'featured' ? 'featured' : 'simple',
					reach_level: input.reach_level === 'regional' ? 'regional' : 'local',
					active: input.active !== 'false',
					start_date: new Date(String(input.start_date)),
					end_date: new Date(String(input.end_date)),
				},
			});
		return this.prisma.tag.create({
			data: {
				name: String(input.name),
				slug: String(input.name)
					.toLowerCase()
					.normalize('NFD')
					.replace(/[\u0300-\u036f]/g, '')
					.replace(/[^a-z0-9]+/g, '-')
					.replace(/(^-|-$)/g, ''),
				group_id: String(input.group_id),
				description: input.description ? String(input.description) : null,
				color: input.color ? String(input.color) : null,
				position: Number(input.position ?? 0),
			},
		});
	}

	async update(resource: string, id: string, input: Record<string, unknown>) {
		this.assertResource(resource);
		if (resource === 'accounts')
			return this.prisma.account.update({
				where: { id },
				data: {
					display_name: input.display_name
						? String(input.display_name)
						: undefined,
					email: input.email ? String(input.email) : undefined,
					active:
						input.active !== undefined ? input.active !== 'false' : undefined,
				},
				omit: { password: true },
			});
		if (resource === 'cities')
			return this.prisma.city.update({
				where: { id },
				data: {
					name: input.name ? String(input.name) : undefined,
					slug: input.slug ? String(input.slug) : undefined,
					description: input.description
						? String(input.description)
						: undefined,
					cover_img_url: input.cover_img_url
						? String(input.cover_img_url)
						: undefined,
				},
			});
		if (resource === 'businesses')
			return this.prisma.business.update({
				where: { id },
				data: {
					cnpj: input.cnpj ? String(input.cnpj) : undefined,
					max_reach_level:
						input.max_reach_level === 'regional' ? 'regional' : undefined,
				},
			});
		if (resource === 'events')
			return this.prisma.event.update({
				where: { id },
				data: {
					name: input.name ? String(input.name) : undefined,
					slug: input.slug ? String(input.slug) : undefined,
					description: input.description
						? String(input.description)
						: undefined,
					cover_img_url: input.cover_img_url
						? String(input.cover_img_url)
						: undefined,
					active:
						input.active !== undefined ? input.active !== 'false' : undefined,
				},
			});
		return this.prisma.tag.update({
			where: { id },
			data: {
				name: input.name ? String(input.name) : undefined,
				description: input.description ? String(input.description) : undefined,
				color: input.color ? String(input.color) : undefined,
				position:
					input.position !== undefined ? Number(input.position) : undefined,
			},
		});
	}

	async remove(resource: string, id: string) {
		this.assertResource(resource);
		try {
			if (resource === 'accounts')
				return this.prisma.account.delete({
					where: { id },
					omit: { password: true },
				});
			if (resource === 'cities')
				return this.prisma.city.delete({ where: { id } });
			if (resource === 'businesses')
				return this.prisma.business.delete({ where: { id } });
			if (resource === 'events')
				return this.prisma.event.delete({ where: { id } });
			return this.prisma.tag.delete({ where: { id } });
		} catch {
			throw new NotFoundException('Resource not found');
		}
	}
}
