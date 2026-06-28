import { randomUUID } from 'crypto';

import {
	DeleteObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

@Injectable()
export class MediasService {
	private readonly s3: S3Client;
	private readonly bucket: string;
	private readonly publicUrl: string;

	constructor(
		private readonly prismaService: PrismaService,
		private readonly config: ConfigService,
	) {
		this.s3 = new S3Client({
			region: 'auto',
			endpoint: config.getOrThrow('R2_ENDPOINT'),
			credentials: {
				accessKeyId: config.getOrThrow('R2_ACCESS_KEY'),
				secretAccessKey: config.getOrThrow('R2_SECRET_KEY'),
			},
		});
		this.bucket = config.getOrThrow('R2_BUCKET');
		this.publicUrl = config.getOrThrow('R2_PUBLIC_URL');
	}

	async upload(file: Express.Multer.File) {
		const key = `uploads/${randomUUID()}-${file.originalname}`;

		await this.s3.send(
			new PutObjectCommand({
				Bucket: this.bucket,
				Key: key,
				Body: file.buffer,
				ContentType: file.mimetype,
			}),
		);

		return {
			key,
			url: `${this.publicUrl}/${key}`,
		};
	}

	async delete(key: string) {
		await this.s3.send(
			new DeleteObjectCommand({
				Bucket: this.bucket,
				Key: key,
			}),
		);

		return { deleted: true };
	}

	getPublicUrl(key: string) {
		return `${this.publicUrl}/${key}`;
	}

	async getMediaByCity(id: string): Promise<any[]> {
		return this.prismaService.media.findMany({
			where: { city_id: id },
			orderBy: [{ is_cover: 'desc' }, { position: 'asc' }],
		});
	}

	async getMediaByAccount(id: string) {
		return this.prismaService.media.findMany({
			where: { account_id: id },
			orderBy: [{ is_cover: 'desc' }, { position: 'asc' }],
		});
	}
}
