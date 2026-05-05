import {
	Injectable,
	NotFoundException,
	ConflictException,
	BadRequestException,
} from '@nestjs/common';
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

	async create(dto: CreateReviewDto) {
		try {
			const entityCount = [dto.business_id, dto.event_id].filter(
				Boolean,
			).length;
			if (entityCount !== 1) {
				throw new BadRequestException(
					'Must provide exactly one business_id or event_id',
				);
			}

			if (dto.business_id) {
				const business = await this.prismaService.business.findUnique({
					where: { id: dto.business_id },
				});
				if (!business) {
					throw new NotFoundException('Business not found');
				}
			}

			if (dto.event_id) {
				const event = await this.prismaService.event.findUnique({
					where: { id: dto.event_id },
				});
				if (!event) {
					throw new NotFoundException('Event not found');
				}
			}

			const review = await this.prismaService.review.create({
				data: dto,
				select: this.select,
			});

			return review;
		} catch (error) {
			if (error.code === 'P2002') {
				// Unique constraint violation
				throw new ConflictException(
					'You have already rated this business/event',
				);
			}
			throw error;
		}
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
			select: this.select,
			orderBy: { created_at: 'desc' },
		});

		return reviews;
	}

	async findOne(id: string) {
		const review = await this.prismaService.review.findUnique({
			where: { id },
			select: this.select,
		});

		if (!review) {
			throw new NotFoundException('Review not found');
		}

		return review;
	}

	async update(id: string, dto: UpdateReviewDto) {
		const existingReview = await this.prismaService.review.findUnique({
			where: { id },
		});

		if (!existingReview) {
			throw new NotFoundException('Review not found');
		}

		const updatedReview = await this.prismaService.review.update({
			where: { id },
			data: dto,
			select: this.select,
		});

		return updatedReview;
	}

	async remove(id: string) {
		const existingReview = await this.prismaService.review.findUnique({
			where: { id },
		});

		if (!existingReview) {
			throw new NotFoundException('Review not found');
		}

		await this.prismaService.review.delete({
			where: { id },
		});

		return { message: 'Review removed successfully' };
	}

	async getAverageRating(businessId?: string, eventId?: string) {
		if (!businessId && !eventId) {
			throw new BadRequestException('Must provide business_id or event_id');
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
			select: this.select,
			orderBy: { created_at: 'desc' },
		});

		return reviews;
	}
}
