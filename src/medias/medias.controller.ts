import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Delete,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediasService } from './medias.service';

@Controller('media')
// TODO: documentar MediasController
export class MediasController {
  constructor(private readonly mediaService: MediasService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.mediaService.upload(file);
  }

  @Delete(':key')
  async delete(@Param('key') key: string) {
    return this.mediaService.delete(key);
  }
}
