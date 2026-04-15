export const UNIQUE_ACCOUNT_FIELDS = ['email', 'phone_number'] as const;

export type UniqueAccountFields = (typeof UNIQUE_ACCOUNT_FIELDS)[number];
