import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
	constructor(private readonly prismaService: PrismaService) {}

	private readonly select = {
		id: true,
		account_id: true,
		business_id: true,
		event_id: true,
		rating: true,
		comment: true,
		created_at: true,
		updated_at: true,
		account: {
			select: {
				id: true,
				display_name: true,
				avatar_url: true,
			},
		},
	};

	private mapReview(review: any) {
		return {
			id: review.id,
			account_id: review.account_id,
			business_id: review.business_id,
			event_id: review.event_id,
			rating: review.rating,
			comment: review.comment,
			created_at: review.created_at,
			updated_at: review.updated_at,
			account: review.account,
		};
	}

	async create(dto: CreateReviewDto) {
		// Validate that exactly one entity type is provided
		const entityCount = [dto.business_id, dto.event_id].filter(Boolean).length;
		if (entityCount !== 1) {
			throw new BadRequestException('Deve ser fornecido exatamente um business_id ou event_id');
		}

		// Check if review already exists
		const existingReview = await this.prismaService.review.findFirst({
			where: {
				account_id: dto.account_id,
				OR: [
					{ business_id: dto.business_id },
					{ event_id: dto.event_id },
				].filter(condition => condition.business_id !== undefined || condition.event_id !== undefined),
			},
		});

		if (existingReview) {
			throw new ConflictException('Você já avaliou este negócio/evento');
		}

		const review = await this.prismaService.review.create({
			data: dto,
			include: {
				account: {
					select: {
						id: true,
						display_name: true,
						avatar_url: true,
					},
				},
			},
		});

		return this.mapReview(review);
	}

	async findAll(businessId?: string, eventId?: string) {
		const where: any = {};
		
		if (businessId) {
			where.business_id = businessId;
		}
		
		if (eventId) {
			where.event_id = eventId;
		}

		const reviews = await this.prismaService.review.findMany({
			where,
			include: {
				account: {
					select: {
						id: true,
						display_name: true,
						avatar_url: true,
					},
				},
			},
			orderBy: { created_at: 'desc' },
		});

		return reviews.map(review => this.mapReview(review));
	}

	async findOne(id: string) {
		const review = await this.prismaService.review.findUnique({
			where: { id },
			include: {
				account: {
					select: {
						id: true,
						display_name: true,
						avatar_url: true,
					},
				},
			},
		});

		if (!review) {
			throw new NotFoundException('Review não encontrada');
		}

		return this.mapReview(review);
	}

	async update(id: string, dto: UpdateReviewDto) {
		const existingReview = await this.prismaService.review.findUnique({
			where: { id },
		});

		if (!existingReview) {
			throw new NotFoundException('Review não encontrada');
		}

		const updatedReview = await this.prismaService.review.update({
			where: { id },
			data: dto,
			include: {
				account: {
					select: {
						id: true,
						display_name: true,
						avatar_url: true,
					},
				},
			},
		});

		return this.mapReview(updatedReview);
	}

	async remove(id: string) {
		const existingReview = await this.prismaService.review.findUnique({
			where: { id },
		});

		if (!existingReview) {
			throw new NotFoundException('Review não encontrada');
		}

		await this.prismaService.review.delete({
			where: { id },
		});

		return { message: 'Review removida com sucesso' };
	}

	async getAverageRating(businessId?: string, eventId?: string) {
		if (!businessId && !eventId) {
			throw new BadRequestException('Deve ser fornecido business_id ou event_id');
		}

		const where: any = {};
		if (businessId) {
			where.business_id = businessId;
		}
		if (eventId) {
			where.event_id = eventId;
		}

		const result = await this.prismaService.review.aggregate({
			where,
			_avg: {
				rating: true,
			},
			_count: {
				rating: true,
			},
		});

		return {
			average_rating: result._avg.rating || 0,
			total_reviews: result._count.rating || 0,
		};
	}

	async findByAccount(accountId: string) {
		const reviews = await this.prismaService.review.findMany({
			where: { account_id: accountId },
			include: {
				account: {
					select: {
						id: true,
						display_name: true,
						avatar_url: true,
					},
				},
			},
			orderBy: { created_at: 'desc' },
		});

		return reviews.map(review => this.mapReview(review));
	}
}
