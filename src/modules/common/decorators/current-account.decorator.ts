import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentAccount {
	id: string;
	role: string;
}

export const CurrentAccount = createParamDecorator(
	(data: keyof CurrentAccount | undefined, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest();
		const user = request.user as CurrentAccount | undefined;

		if (!user) {
			return undefined;
		}

		return data ? user[data] : user;
	},
);
