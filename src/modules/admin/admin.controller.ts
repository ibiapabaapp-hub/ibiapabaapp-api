import { Controller, Get } from '@nestjs/common';
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
}
