import { Exclude, Expose, Transform } from 'class-transformer';

export class SecureAccountDTO {
	@Expose() id: string;
	@Expose() email: string;
	@Exclude() password?: string;

	constructor(partial: any) {
		Object.assign(this, partial);
	}
}

export class SecureAccountWithProfilesDTO {
	@Expose() id: string;
	@Expose() email: string;

	@Expose()
	@Transform(({ obj }) => {
		// "Achata" a relação N:N para um array simples de perfis
		return obj.profiles?.map((ap) => ({
			...ap.profile,
			role: ap.role,
		}));
	})
	profiles?: any[];

	@Exclude() password?: string;

	constructor(partial: any) {
		Object.assign(this, partial);
	}
}
