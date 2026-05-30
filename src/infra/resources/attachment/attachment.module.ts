import { DatabaseModule } from '@/infra/database/database.module';
import { Module } from '@nestjs/common';
import { AttachmentController } from './attachment.controller';
import { UploadAttachmentService } from './services/upload-attachment.service';
import { S3StorageGateway } from '@/infra/storage/s3-storage-gateway';

@Module({
  imports: [DatabaseModule],
  controllers: [AttachmentController],
  providers: [UploadAttachmentService, S3StorageGateway],
})
export class AttachmentModule {}
