import { randomUUID } from 'crypto';

import {
	DeleteObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

@UseInterceptors(
	FileInterceptor('file', {
		limits: {
			fileSize: 20 * 1024 * 1024,
		},
		fileFilter: (req, file, cb) => {
			if (
				file.mimetype.startsWith('image/') ||
				file.mimetype.startsWith('video/')
			) {
				cb(null, true);
			} else {
				cb(new Error('Invalid file type'), false);
			}
		},
	}),
)
// TODO: testar MediasService
@Injectable()
export class MediasService {
	private s3: S3Client;

	constructor(private readonly prismaService: PrismaService) {
		this.s3 = new S3Client({
			region: 'auto',
			endpoint: process.env.R2_ENDPOINT!,
			credentials: {
				accessKeyId: process.env.R2_ACCESS_KEY!,
				secretAccessKey: process.env.R2_SECRET_KEY!,
			},
		});
	}

	async upload(file: Express.Multer.File) {
		const key = `uploads/${randomUUID()}-${file.originalname}`;

		await this.s3.send(
			new PutObjectCommand({
				Bucket: process.env.R2_BUCKET!,
				Key: key,
				Body: file.buffer,
				ContentType: file.mimetype,
			}),
		);

		return {
			key,
			url: `${process.env.R2_PUBLIC_URL}/${key}`,
		};
	}

	async delete(key: string) {
		await this.s3.send(
			new DeleteObjectCommand({
				Bucket: process.env.R2_BUCKET,
				Key: key,
			}),
		);

		return { deleted: true };
	}

	getPublicUrl(key: string) {
		return `${process.env.R2_PUBLIC_URL}/${key}`;
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
