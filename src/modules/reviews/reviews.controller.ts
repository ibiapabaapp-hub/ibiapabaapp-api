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
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller('reviews')
export class ReviewsController {
	constructor(private readonly reviewsService: ReviewsService) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	create(@Body() createReviewDto: CreateReviewDto) {
		return this.reviewsService.create(createReviewDto);
	}

	@Get()
	findAll(
		@Query('businessId') businessId?: string,
		@Query('eventId') eventId?: string,
	) {
		return this.reviewsService.findAll(businessId, eventId);
	}

	@Get('account/:accountId')
	findByAccount(@Param('accountId') accountId: string) {
		return this.reviewsService.findByAccount(accountId);
	}

	@Get('business/:businessId/average')
	getBusinessAverage(@Param('businessId') businessId: string) {
		return this.reviewsService.getAverageRating(businessId);
	}

	@Get('event/:eventId/average')
	getEventAverage(@Param('eventId') eventId: string) {
		return this.reviewsService.getAverageRating(undefined, eventId);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.reviewsService.findOne(id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
		return this.reviewsService.update(id, updateReviewDto);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.OK)
	remove(@Param('id') id: string) {
		return this.reviewsService.remove(id);
	}
}
