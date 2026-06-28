import { Test, TestingModule } from '@nestjs/testing';
import { reach_level } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { MediasService } from 'src/modules/medias/medias.service';

import { BusinessesController } from '../businesses.controller';
import { BusinessesService } from '../businesses.service';
import { CreateBusinessDTO } from '../dto/create-business.dto';

describe('BusinessesController', () => {
	let controller: BusinessesController;
	let service: DeepMockProxy<BusinessesService>;
	let mediasService: DeepMockProxy<MediasService>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [BusinessesController],
			providers: [
				{
					provide: BusinessesService,
					useValue: mockDeep<BusinessesService>(),
				},
				{ provide: MediasService, useValue: mockDeep<MediasService>() },
			],
		}).compile();

		controller = module.get<BusinessesController>(BusinessesController);
		service = module.get<DeepMockProxy<BusinessesService>>(BusinessesService);
		mediasService = module.get<DeepMockProxy<MediasService>>(MediasService);
	});

	it('should call service.create with correct data', async () => {
		const dto: CreateBusinessDTO = {
			account_id: 'test',
			slug: 'empresa-teste',
			id: '',
			cnpj: null,
			cover_img_url: null,
			description: null,
			active: false,
			created_at: new Date(),
			updated_at: new Date(),
			max_reach_level: reach_level.local,
		};
		await controller.create(dto);
		expect(service.create).toHaveBeenCalledWith(dto);
	});

	it('should call service.findAll', async () => {
		await controller.findAll();
		expect(service.findAll).toHaveBeenCalled();
	});

	it('should call mediasService.getMediaByAccount', async () => {
		await controller.getBusinessMedia('uuid');
		expect(mediasService.getMediaByAccount).toHaveBeenCalledWith('uuid');
	});
});
