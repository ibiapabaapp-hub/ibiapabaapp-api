export interface SendEmailPayload {
	to: string;
	subject: string;
	html: string;
}

export interface EmailStrategy {
	send(payload: SendEmailPayload): Promise<void>;
}

export const EMAIL_STRATEGY = Symbol('EMAIL_STRATEGY');
