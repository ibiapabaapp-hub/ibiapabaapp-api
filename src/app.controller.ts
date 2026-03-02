import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

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
