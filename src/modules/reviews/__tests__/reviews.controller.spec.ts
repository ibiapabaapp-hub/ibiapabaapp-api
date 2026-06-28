import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { ReviewsController } from '../reviews.controller';
import { ReviewsService } from '../reviews.service';

describe('ReviewsController', () => {
	let controller: ReviewsController;
	let service: DeepMockProxy<ReviewsService>;

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
			controllers: [ReviewsController],
			providers: [
				{
					provide: ReviewsService,
					useValue: mockDeep<ReviewsService>(),
				},
			],
		}).compile();

		controller = module.get<ReviewsController>(ReviewsController);
		service = module.get(ReviewsService);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('create', () => {
		it('should create a review', async () => {
			const createDto: CreateReviewDto = {
				account_id: 'account-1',
				business_id: 'business-1',
				rating: 5,
				comment: 'Great place!',
			};

			service.create.mockResolvedValue(mockReview);

			const result = await controller.create(createDto);

			expect(service.create).toHaveBeenCalledWith(createDto);
			expect(result).toEqual(mockReview);
		});
	});

	describe('findAll', () => {
		it('should return reviews for business', async () => {
			const reviews = [mockReview];
			service.findAll.mockResolvedValue(reviews);

			const result = await controller.findAll('business-1');

			expect(service.findAll).toHaveBeenCalledWith('business-1', undefined);
			expect(result).toEqual(reviews);
		});

		it('should return reviews for event', async () => {
			const reviews = [mockReview];
			service.findAll.mockResolvedValue(reviews);

			const result = await controller.findAll(undefined, 'event-1');

			expect(service.findAll).toHaveBeenCalledWith(undefined, 'event-1');
			expect(result).toEqual(reviews);
		});

		it('should return all reviews when no filters', async () => {
			const reviews = [mockReview];
			service.findAll.mockResolvedValue(reviews);

			const result = await controller.findAll();

			expect(service.findAll).toHaveBeenCalledWith(undefined, undefined);
			expect(result).toEqual(reviews);
		});
	});

	describe('findByAccount', () => {
		it('should return reviews by account', async () => {
			const reviews = [mockReview];
			service.findByAccount.mockResolvedValue(reviews);

			const result = await controller.findByAccount('account-1');

			expect(service.findByAccount).toHaveBeenCalledWith('account-1');
			expect(result).toEqual(reviews);
		});
	});

	describe('getBusinessAverage', () => {
		it('should return average rating for business', async () => {
			const averageRating = {
				average_rating: 4.5,
				total_reviews: 10,
			};

			service.getAverageRating.mockResolvedValue(averageRating);

			const result = await controller.getBusinessAverage('business-1');

			expect(service.getAverageRating).toHaveBeenCalledWith('business-1');
			expect(result).toEqual(averageRating);
		});
	});

	describe('getEventAverage', () => {
		it('should return average rating for event', async () => {
			const averageRating = {
				average_rating: 3.8,
				total_reviews: 5,
			};

			service.getAverageRating.mockResolvedValue(averageRating);

			const result = await controller.getEventAverage('event-1');

			expect(service.getAverageRating).toHaveBeenCalledWith(
				undefined,
				'event-1',
			);
			expect(result).toEqual(averageRating);
		});
	});

	describe('findOne', () => {
		it('should return a review by id', async () => {
			service.findOne.mockResolvedValue(mockReview);

			const result = await controller.findOne('review-1');

			expect(service.findOne).toHaveBeenCalledWith('review-1');
			expect(result).toEqual(mockReview);
		});
	});

	describe('update', () => {
		it('should update a review', async () => {
			const updateDto: UpdateReviewDto = {
				rating: 4,
				comment: 'Updated comment',
			};

			const updatedReview = { ...mockReview, ...updateDto };
			service.update.mockResolvedValue(updatedReview);

			const result = await controller.update('review-1', updateDto);

			expect(service.update).toHaveBeenCalledWith('review-1', updateDto);
			expect(result).toEqual(updatedReview);
		});
	});

	describe('remove', () => {
		it('should remove a review', async () => {
			const deleteResult = { message: 'Review removida com sucesso' };
			service.remove.mockResolvedValue(deleteResult);

			const result = await controller.remove('review-1');

			expect(service.remove).toHaveBeenCalledWith('review-1');
			expect(result).toEqual(deleteResult);
		});
	});
});
