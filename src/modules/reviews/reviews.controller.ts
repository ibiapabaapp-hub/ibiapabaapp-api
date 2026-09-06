import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	HttpCode,
	HttpStatus,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiQuery,
	ApiResponse,
} from '@nestjs/swagger';
import { CurrentAccount } from 'src/modules/common/decorators/current-account.decorator';
import { Public } from 'src/modules/common/decorators/public.decorator';

import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './reviews.service';

@Controller({ path: 'reviews', version: '1' })
export class ReviewsController {
	constructor(private readonly reviewsService: ReviewsService) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create a review for a business or event' })
	@ApiBody({ type: CreateReviewDto })
	@ApiResponse({ status: 201, type: ReviewResponseDto })
	@ApiResponse({
		status: 409,
		description: 'Review already exists for this target',
	})
	create(
		@CurrentAccount('id') accountId: string,
		@Body() createReviewDto: CreateReviewDto,
	) {
		return this.reviewsService.create(accountId, createReviewDto);
	}

	@Get()
	@Public()
	@ApiOperation({ summary: 'List reviews for exactly one business or event' })
	@ApiQuery({
		name: 'businessId',
		required: false,
		description: 'Business UUID',
	})
	@ApiQuery({ name: 'eventId', required: false, description: 'Event UUID' })
	@ApiResponse({ status: 200, type: ReviewResponseDto, isArray: true })
	@ApiResponse({
		status: 400,
		description: 'Provide exactly one of businessId or eventId',
	})
	findAll(
		@Query('businessId') businessId?: string,
		@Query('eventId') eventId?: string,
	) {
		return this.reviewsService.findAll(businessId, eventId);
	}

	@Get('business/:businessId/average')
	getBusinessAverage(@Param('businessId') businessId: string) {
		return this.reviewsService.getAverageRating(businessId);
	}

	@Get('event/:eventId/average')
	getEventAverage(@Param('eventId') eventId: string) {
		return this.reviewsService.getAverageRating(undefined, eventId);
	}

	@Get('account/:accountId')
	findByAccount(@Param('accountId') accountId: string) {
		return this.reviewsService.findByAccount(accountId);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.reviewsService.findOne(id);
	}

	@Patch(':id')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update your own review' })
	@ApiBody({ type: UpdateReviewDto })
	@ApiResponse({ status: 200, type: ReviewResponseDto })
	@ApiResponse({
		status: 403,
		description: 'Review belongs to another account',
	})
	update(
		@Param('id') id: string,
		@CurrentAccount('id') accountId: string,
		@Body() updateReviewDto: UpdateReviewDto,
	) {
		return this.reviewsService.update(id, accountId, updateReviewDto);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.OK)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Remove your own review' })
	@ApiResponse({
		status: 403,
		description: 'Review belongs to another account',
	})
	remove(@Param('id') id: string, @CurrentAccount('id') accountId: string) {
		return this.reviewsService.remove(id, accountId);
	}
}
