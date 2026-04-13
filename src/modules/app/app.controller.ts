import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { Public } from '../../modules/common/decorators/public.decorator';
import { AppService } from './app.service';

@Controller({ version: '1' })
export class AppController {
	constructor(private readonly appService: AppService) {}

	@ApiOperation({ summary: 'Teste Hello World' })
	@ApiResponse({ status: 200 })
	@Get()
	@Public()
	getHello() {
		return this.appService.getHello();
	}
}
