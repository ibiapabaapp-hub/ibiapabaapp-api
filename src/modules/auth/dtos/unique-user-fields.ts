export const UNIQUE_USER_FIELDS = [
	'email',
	'username',
	'phone_number',
] as const;

export type UniqueUserField = (typeof UNIQUE_USER_FIELDS)[number];
