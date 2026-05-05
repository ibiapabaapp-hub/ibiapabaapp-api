import {
	BadRequestException,
	ConflictException,
	NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { ReviewsService } from '../reviews.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';

describe('ReviewsService', () => {
	let service: ReviewsService;
	let prisma: DeepMockProxy<PrismaService>;

	const selectPattern = {
		select: {
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
		},
	}

	const mockReview = {
		id: 'review-1',
		account_id: 'account-1',
		business_id: 'business-1',
		event_id: null,
		rating: 5,
		comment: 'Great place!',
		created_at: new Date(),
		updated_at: new Date(),
		account: {
			id: 'account-1',
			display_name: 'John Doe',
			avatar_url: 'https://example.com/avatar.jpg',
		},
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ReviewsService,
				{
					provide: PrismaService,
					useValue: mockDeep<PrismaService>(),
				},
			],
		}).compile();

		service = module.get<ReviewsService>(ReviewsService);
		prisma = module.get(PrismaService);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('create', () => {
		it('should create a business review successfully', async () => {
			const createDto: CreateReviewDto = {
				account_id: 'account-1',
				business_id: 'business-1',
				rating: 5,
				comment: 'Great place!',
			};

			const mockBusiness = {
				id: 'business-1',
				account_id: 'account-1',
				cnpj: '123456789',
				max_reach_level: 'local' as const,
				created_at: new Date(),
				updated_at: new Date(),
			};

			prisma.business.findUnique.mockResolvedValue(mockBusiness);
			prisma.review.create.mockResolvedValue(mockReview);

			const result = await service.create(createDto);

			expect(prisma.business.findUnique).toHaveBeenCalledWith({
				where: { id: 'business-1' }
			});
			expect(prisma.review.create).toHaveBeenCalledWith({
				data: createDto,
				select: selectPattern.select,
			});
			expect(result).toEqual(mockReview);
		});

		it('should create an event review successfully', async () => {
			const createDto: CreateReviewDto = {
				account_id: 'account-1',
				event_id: 'event-1',
				rating: 4,
				comment: 'Nice event!',
			};

			const eventReview = { ...mockReview, event_id: 'event-1', business_id: null };
			const mockEvent = {
				id: 'event-1',
				slug: 'test-event',
				owner_account_id: 'account-1',
				name: 'Test Event',
				description: 'Test Description',
				cover_img_url: null,
				reach_level: 'local' as const,
				type: 'simple' as const,
				start_date: new Date(),
				end_date: new Date(),
				active: true,
				created_at: new Date(),
				updated_at: new Date(),
			};

			prisma.event.findUnique.mockResolvedValue(mockEvent);
			prisma.review.create.mockResolvedValue(eventReview);

			const result = await service.create(createDto);

			expect(prisma.event.findUnique).toHaveBeenCalledWith({
				where: { id: 'event-1' }
			});
			expect(prisma.review.create).toHaveBeenCalledWith({
				data: createDto,
				select: selectPattern.select,
			});
			expect(result).toEqual(eventReview);
		});

		it('should throw BadRequestException when no entity is provided', async () => {
			const createDto: CreateReviewDto = {
				account_id: 'account-1',
				rating: 5,
			};

			await expect(service.create(createDto)).rejects.toThrow(
				new BadRequestException('Must provide exactly one business_id or event_id'),
			);
		});

		it('should throw BadRequestException when both entities are provided', async () => {
			const createDto: CreateReviewDto = {
				account_id: 'account-1',
				business_id: 'business-1',
				event_id: 'event-1',
				rating: 5,
			};

			await expect(service.create(createDto)).rejects.toThrow(
				new BadRequestException('Must provide exactly one business_id or event_id'),
			);
		});

		it('should throw NotFoundException when business does not exist', async () => {
			const createDto: CreateReviewDto = {
				account_id: 'account-1',
				business_id: 'nonexistent-business',
				rating: 5,
				comment: 'Great place!',
			};

			prisma.business.findUnique.mockResolvedValue(null);

			await expect(service.create(createDto)).rejects.toThrow(
				new NotFoundException('Business not found'),
			);
		});

		it('should throw NotFoundException when event does not exist', async () => {
			const createDto: CreateReviewDto = {
				account_id: 'account-1',
				event_id: 'nonexistent-event',
				rating: 4,
				comment: 'Nice event!',
			};

			prisma.event.findUnique.mockResolvedValue(null);

			await expect(service.create(createDto)).rejects.toThrow(
				new NotFoundException('Event not found'),
			);
		});

		it('should throw ConflictException when review already exists', async () => {
			const createDto: CreateReviewDto = {
				account_id: 'account-1',
				business_id: 'business-1',
				rating: 5,
			};

			const mockBusiness = {
				id: 'business-1',
				account_id: 'account-1',
				cnpj: '123456789',
				max_reach_level: 'local' as const,
				created_at: new Date(),
				updated_at: new Date(),
			};

			const error = new Error('Unique constraint violation');
			(error as any).code = 'P2002';
			prisma.business.findUnique.mockResolvedValue(mockBusiness);
			prisma.review.create.mockRejectedValue(error);

			await expect(service.create(createDto)).rejects.toThrow(
				new ConflictException('You have already rated this business/event'),
			);
		});
	});

	describe('findAll', () => {
		it('should return all business reviews', async () => {
			const reviews = [mockReview];
			prisma.review.findMany.mockResolvedValue(reviews);

			const result = await service.findAll('business-1');

			expect(prisma.review.findMany).toHaveBeenCalledWith({
				where: { business_id: 'business-1' },
				select: selectPattern.select,
				orderBy: { created_at: 'desc' },
			});
			expect(result).toEqual(reviews);
		});

		it('should return all event reviews', async () => {
			const eventReview = { ...mockReview, event_id: 'event-1', business_id: null };
			const reviews = [eventReview];
			prisma.review.findMany.mockResolvedValue(reviews);

			const result = await service.findAll(undefined, 'event-1');

			expect(prisma.review.findMany).toHaveBeenCalledWith({
				where: { event_id: 'event-1' },
				select: selectPattern.select,
				orderBy: { created_at: 'desc' },
			});
			expect(result).toEqual(reviews);
		});

		it('should return all reviews when no filters provided', async () => {
			const reviews = [mockReview];
			prisma.review.findMany.mockResolvedValue(reviews);

			const result = await service.findAll();

			expect(prisma.review.findMany).toHaveBeenCalledWith({
				where: {},
				select: selectPattern.select,
				orderBy: { created_at: 'desc' },
			});
			expect(result).toHaveLength(1);
		});
	});

	describe('findOne', () => {
		it('should return a review by id', async () => {
			prisma.review.findUnique.mockResolvedValue(mockReview);

			const result = await service.findOne('review-1');

			expect(prisma.review.findUnique).toHaveBeenCalledWith({
				where: { id: 'review-1' },
				select: selectPattern.select,
			});
			expect(result).toEqual(mockReview);
		});

		it('should throw NotFoundException when review to update not found', async () => {
			const updateDto: UpdateReviewDto = { rating: 4 };
			prisma.review.findUnique.mockResolvedValue(null);

			await expect(service.update('invalid-id', updateDto)).rejects.toThrow(
				new NotFoundException('Review not found'),
			);
		});
	});

	describe('remove', () => {
		it('should remove a review successfully', async () => {
			prisma.review.findUnique.mockResolvedValue(mockReview);
			prisma.review.delete.mockResolvedValue(mockReview);

			const result = await service.remove('review-1');

			expect(prisma.review.findUnique).toHaveBeenCalledWith({
				where: { id: 'review-1' },
			});
			expect(prisma.review.delete).toHaveBeenCalledWith({
				where: { id: 'review-1' },
			});
			expect(result).toEqual({ message: 'Review removed successfully' });
		});

		it('should throw NotFoundException when review to remove not found', async () => {
			prisma.review.findUnique.mockResolvedValue(null);

			await expect(service.remove('invalid-id')).rejects.toThrow(
				new NotFoundException('Review not found'),
			);
		});
	});

	describe('getAverageRating', () => {
		it('should return average rating for business', async () => {
			const mockAggregate = {
				_avg: { rating: 4.5 },
				_count: { rating: 10 },
				_sum: { rating: 45 },
				_min: { rating: 1 },
				_max: { rating: 5 },
			};

			prisma.review.aggregate.mockResolvedValue(mockAggregate);

			const result = await service.getAverageRating('business-1');

			expect(prisma.review.aggregate).toHaveBeenCalledWith({
				where: { business_id: 'business-1' },
				_avg: { rating: true },
				_count: { rating: true },
			});
			expect(result).toEqual({
				average_rating: 4.5,
				total_reviews: 10,
			});
		});

		it('should return average rating for event', async () => {
			const mockAggregate = {
				_avg: { rating: 3.8 },
				_count: { rating: 5 },
				_sum: { rating: 19 },
				_min: { rating: 1 },
				_max: { rating: 5 },
			};

			prisma.review.aggregate.mockResolvedValue(mockAggregate);

			const result = await service.getAverageRating(undefined, 'event-1');

			expect(prisma.review.aggregate).toHaveBeenCalledWith({
				where: { event_id: 'event-1' },
				_avg: { rating: true },
				_count: { rating: true },
			});
			expect(result).toEqual({
				average_rating: 3.8,
				total_reviews: 5,
			});
		});

		it('should return zero values when no reviews exist', async () => {
			const mockAggregate = {
				_avg: { rating: null },
				_count: { rating: 0 },
				_sum: { rating: 0 },
				_min: { rating: 0 },
				_max: { rating: 0 },
			};

			prisma.review.aggregate.mockResolvedValue(mockAggregate);

			const result = await service.getAverageRating('business-1');

			expect(result).toEqual({
				average_rating: 0,
				total_reviews: 0,
			});
		});

		it('should throw BadRequestException when no entity provided', async () => {
			await expect(service.getAverageRating()).rejects.toThrow(
				new BadRequestException('Must provide business_id or event_id'),
			);
		});
	});

	describe('findByAccount', () => {
		it('should return all reviews by account', async () => {
			const reviews = [mockReview];
			prisma.review.findMany.mockResolvedValue(reviews);

			const result = await service.findByAccount('account-1');

			expect(prisma.review.findMany).toHaveBeenCalledWith({
				where: { account_id: 'account-1' },
				select: selectPattern.select,
				orderBy: { created_at: 'desc' },
			});
			expect(result).toEqual(reviews);
		});
	});
});
