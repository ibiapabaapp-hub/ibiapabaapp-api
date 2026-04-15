import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
	protected async getTracker(req: Record<string, any>): Promise<string> {
		if (req.user?.id) {
			return `user-${req.user.id}`;
		}

		return req.ips.length ? req.ips[0] : req.ip;
	}
}
