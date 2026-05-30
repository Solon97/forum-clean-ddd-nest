import {
  Controller,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadAttachmentService } from './services/upload-attachment.service';
import { UploadedAttachmentFile } from './types/uploaded-attachment-file';

const MAX_ATTACHMENT_SIZE_IN_BYTES = 5 * 1024 * 1024;
const VALID_ATTACHMENT_TYPES = /^(image\/(jpeg|png|webp)|application\/pdf)$/;

@Controller('attachments')
export class AttachmentController {
  constructor(
    private readonly uploadAttachmentService: UploadAttachmentService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: MAX_ATTACHMENT_SIZE_IN_BYTES,
      },
    }),
  )
  upload(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: VALID_ATTACHMENT_TYPES,
        })
        .addMaxSizeValidator({
          maxSize: MAX_ATTACHMENT_SIZE_IN_BYTES,
        })
        .build({
          fileIsRequired: true,
        }),
    )
    file: UploadedAttachmentFile,
  ) {
    return this.uploadAttachmentService.execute(file);
  }
}
