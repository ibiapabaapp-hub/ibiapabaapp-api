import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller({ path: 'admin', version: '1' })
@Roles('admin', 'super_admin')
export class AdminController {
	constructor(private readonly adminService: AdminService) {}

	@Get('overview')
	@ApiOperation({ summary: 'Resumo operacional do painel administrativo' })
	overview() {
		return this.adminService.overview();
	}

	@Get('resources/:resource')
	list(@Param('resource') resource: string) {
		return this.adminService.list(resource);
	}

	@Post('resources/:resource')
	create(
		@Param('resource') resource: string,
		@Body() body: Record<string, unknown>,
	) {
		return this.adminService.create(resource, body);
	}

	@Patch('resources/:resource/:id')
	update(
		@Param('resource') resource: string,
		@Param('id') id: string,
		@Body() body: Record<string, unknown>,
	) {
		return this.adminService.update(resource, id, body);
	}

	@Delete('resources/:resource/:id')
	remove(@Param('resource') resource: string, @Param('id') id: string) {
		return this.adminService.remove(resource, id);
	}
}
