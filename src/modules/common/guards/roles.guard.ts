import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { REQUIRED_ROLES } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext) {
		const roles = this.reflector.getAllAndOverride<string[]>(REQUIRED_ROLES, [
			context.getHandler(),
			context.getClass(),
		]);
		if (!roles?.length) return true;
		const request = context
			.switchToHttp()
			.getRequest<{ user?: { role?: string } }>();
		if (!request.user?.role || !roles.includes(request.user.role)) {
			throw new ForbiddenException('Insufficient permissions');
		}
		return true;
	}
}
