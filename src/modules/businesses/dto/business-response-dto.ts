import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class BusinessResponseDTO {
	@Expose()
	id: string;

	@Expose()
	@Transform(({ obj }) => obj.profile?.display_name)
	name: string;

	@Expose()
	@Transform(({ obj }) => obj.profile?.slug)
	slug: string;

	@Expose()
	@Transform(({ obj }) => obj.profile?.bio)
	bio: string;

	@Expose()
	@Transform(({ obj }) => obj.profile?.avatar_url)
	avatar: string;

	@Expose()
	@Transform(({ obj }) => obj.profile?.created_at)
	created_at: string;

	@Expose()
	max_reach_level: string;

	@Expose()
	@Transform(({ obj }) => obj.tags?.map((t) => t.tag.name) || [])
	tags: string[];

	constructor(partial: any) {
		Object.assign(this, partial);
	}
}
