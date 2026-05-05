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

	const mockAccount = {
		id: 'account-1',
		display_name: 'John Doe',
		avatar_url: 'https://example.com/avatar.jpg',
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

			prisma.review.findFirst.mockResolvedValue(null);
			prisma.review.create.mockResolvedValue(mockReview);

			const result = await service.create(createDto);

			expect(prisma.review.findFirst).toHaveBeenCalledWith({
				where: {
					account_id: 'account-1',
					OR: [{ business_id: 'business-1' }],
				},
			});
			expect(prisma.review.create).toHaveBeenCalledWith({
				data: createDto,
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
			expect(result).toEqual({
				id: 'review-1',
				account_id: 'account-1',
				business_id: 'business-1',
				event_id: null,
				rating: 5,
				comment: 'Great place!',
				created_at: mockReview.created_at,
				updated_at: mockReview.updated_at,
				account: mockAccount,
			});
		});

		it('should create an event review successfully', async () => {
			const createDto: CreateReviewDto = {
				account_id: 'account-1',
				event_id: 'event-1',
				rating: 4,
				comment: 'Nice event!',
			};

			const eventReview = { ...mockReview, event_id: 'event-1', business_id: null };
			prisma.review.findFirst.mockResolvedValue(null);
			prisma.review.create.mockResolvedValue(eventReview);

			const result = await service.create(createDto);

			expect(prisma.review.findFirst).toHaveBeenCalledWith({
				where: {
					account_id: 'account-1',
					OR: [{ event_id: 'event-1' }],
				},
			});
			expect(result).toEqual({
				...eventReview,
				account: mockAccount,
			});
		});

		it('should throw BadRequestException when no entity is provided', async () => {
			const createDto: CreateReviewDto = {
				account_id: 'account-1',
				rating: 5,
			};

			await expect(service.create(createDto)).rejects.toThrow(
				new BadRequestException('Deve ser fornecido exatamente um business_id ou event_id'),
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
				new BadRequestException('Deve ser fornecido exatamente um business_id ou event_id'),
			);
		});

		it('should throw ConflictException when review already exists', async () => {
			const createDto: CreateReviewDto = {
				account_id: 'account-1',
				business_id: 'business-1',
				rating: 5,
			};

			prisma.review.findFirst.mockResolvedValue(mockReview);

			await expect(service.create(createDto)).rejects.toThrow(
				new ConflictException('Você já avaliou este negócio/evento'),
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
			expect(result).toEqual([
				{
					id: 'review-1',
					account_id: 'account-1',
					business_id: 'business-1',
					event_id: null,
					rating: 5,
					comment: 'Great place!',
					created_at: mockReview.created_at,
					updated_at: mockReview.updated_at,
					account: mockAccount,
				},
			]);
		});

		it('should return all event reviews', async () => {
			const eventReview = { ...mockReview, event_id: 'event-1', business_id: null };
			const reviews = [eventReview];
			prisma.review.findMany.mockResolvedValue(reviews);

			const result = await service.findAll(undefined, 'event-1');

			expect(prisma.review.findMany).toHaveBeenCalledWith({
				where: { event_id: 'event-1' },
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
			expect(result).toEqual([
				{
					...eventReview,
					account: mockAccount,
				},
			]);
		});

		it('should return all reviews when no filters provided', async () => {
			const reviews = [mockReview];
			prisma.review.findMany.mockResolvedValue(reviews);

			const result = await service.findAll();

			expect(prisma.review.findMany).toHaveBeenCalledWith({
				where: {},
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
			expect(result).toHaveLength(1);
		});
	});

	describe('findOne', () => {
		it('should return a review by id', async () => {
			prisma.review.findUnique.mockResolvedValue(mockReview);

			const result = await service.findOne('review-1');

			expect(prisma.review.findUnique).toHaveBeenCalledWith({
				where: { id: 'review-1' },
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
			expect(result).toEqual({
				id: 'review-1',
				account_id: 'account-1',
				business_id: 'business-1',
				event_id: null,
				rating: 5,
				comment: 'Great place!',
				created_at: mockReview.created_at,
				updated_at: mockReview.updated_at,
				account: mockAccount,
			});
		});

		it('should throw NotFoundException when review not found', async () => {
			prisma.review.findUnique.mockResolvedValue(null);

			await expect(service.findOne('invalid-id')).rejects.toThrow(
				new NotFoundException('Review não encontrada'),
			);
		});
	});

	describe('update', () => {
		it('should update a review successfully', async () => {
			const updateDto: UpdateReviewDto = {
				rating: 4,
				comment: 'Updated comment',
			};

			const updatedReview = { ...mockReview, rating: 4, comment: 'Updated comment' };
			prisma.review.findUnique.mockResolvedValue(mockReview);
			prisma.review.update.mockResolvedValue(updatedReview);

			const result = await service.update('review-1', updateDto);

			expect(prisma.review.findUnique).toHaveBeenCalledWith({
				where: { id: 'review-1' },
			});
			expect(prisma.review.update).toHaveBeenCalledWith({
				where: { id: 'review-1' },
				data: updateDto,
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
			expect(result).toEqual({
				...updatedReview,
				account: mockAccount,
			});
		});

		it('should throw NotFoundException when review to update not found', async () => {
			const updateDto: UpdateReviewDto = { rating: 4 };
			prisma.review.findUnique.mockResolvedValue(null);

			await expect(service.update('invalid-id', updateDto)).rejects.toThrow(
				new NotFoundException('Review não encontrada'),
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
			expect(result).toEqual({ message: 'Review removida com sucesso' });
		});

		it('should throw NotFoundException when review to remove not found', async () => {
			prisma.review.findUnique.mockResolvedValue(null);

			await expect(service.remove('invalid-id')).rejects.toThrow(
				new NotFoundException('Review não encontrada'),
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
				new BadRequestException('Deve ser fornecido business_id ou event_id'),
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
			expect(result).toEqual([
				{
					id: 'review-1',
					account_id: 'account-1',
					business_id: 'business-1',
					event_id: null,
					rating: 5,
					comment: 'Great place!',
					created_at: mockReview.created_at,
					updated_at: mockReview.updated_at,
					account: mockAccount,
				},
			]);
		});
	});
});
