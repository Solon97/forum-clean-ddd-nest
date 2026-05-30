import {
  Attachment,
  AttachmentProps,
} from '@/domain/forum/entities/attachment';
import { AttachmentRepository } from '@/domain/forum/repositories/attachment-repository';
import { Injectable } from '@nestjs/common';
import { PrismaAttachmentMapper } from '../mappers/prisma-attachment-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaAttachmentRepository implements AttachmentRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(attachment: Attachment<AttachmentProps>): Promise<void> {
    const data = PrismaAttachmentMapper.toPrisma(attachment);

    await this.prismaService.attachment.create({
      data,
    });
  }
}
