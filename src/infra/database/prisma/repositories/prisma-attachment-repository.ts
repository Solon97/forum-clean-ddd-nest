import {
  Attachment,
  AttachmentProps,
} from '@/domain/forum/entities/attachment';
import {
  AttachmentAvailabilityStatus,
  AttachmentRepository,
} from '@/domain/forum/repositories/attachment-repository';
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

  async findManyAvailabilityStatusByIds(
    attachmentIds: string[],
  ): Promise<AttachmentAvailabilityStatus[]> {
    if (attachmentIds.length === 0) {
      return [];
    }

    return this.prismaService.attachment.findMany({
      where: {
        id: {
          in: attachmentIds,
        },
      },
      select: {
        id: true,
        questionId: true,
        answerId: true,
      },
    });
  }
}
