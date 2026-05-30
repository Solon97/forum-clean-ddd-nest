import { UploadAttachmentUseCase } from '@/domain/forum/use-cases/upload-attachment';
import { PrismaAttachmentRepository } from '@/infra/database/prisma/repositories/prisma-attachment-repository';
import { handleUseCaseError } from '@/infra/shared/handle-use-case-error';
import { S3StorageGateway } from '@/infra/storage/s3-storage-gateway';
import { Injectable } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';
import { UploadedAttachmentFile } from '../types/uploaded-attachment-file';

@Injectable()
export class UploadAttachmentService {
  constructor(
    private readonly attachmentRepository: PrismaAttachmentRepository,
    private readonly storageGateway: S3StorageGateway,
  ) {}

  async execute(file: UploadedAttachmentFile) {
    const useCase = new UploadAttachmentUseCase(
      this.attachmentRepository,
      this.storageGateway,
    );

    const result = await useCase.execute({
      fileName: file.originalname,
      fileType: file.mimetype,
      body: file.buffer,
      size: file.size,
    });

    if (isLeft(result)) {
      handleUseCaseError(result.left);
    }

    return {
      id: result.right.attachment.id.toString(),
      url: result.right.attachment.url,
    };
  }
}
