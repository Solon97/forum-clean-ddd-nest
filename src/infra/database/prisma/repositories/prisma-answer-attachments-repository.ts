import { AnswerAttachment } from '@/domain/forum/entities/answer-attachment';
import { AnswerAttachmentsRepository } from '@/domain/forum/repositories/answer-attachments-repository';
import {
  InvalidUniqueEntityIdError,
  UniqueEntityId,
} from '@/shared/entities/value-objects/unique-entity-id';
import { Injectable } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaAnswerAttachmentsRepository implements AnswerAttachmentsRepository {
  items: AnswerAttachment[] = [];

  constructor(private readonly prismaService: PrismaService) {}

  async findManyByAnswerId(answerId: string): Promise<AnswerAttachment[]> {
    const answerIdOrError = UniqueEntityId.createFromExistingId(answerId);
    if (isLeft(answerIdOrError)) {
      throw new InvalidUniqueEntityIdError('Answer');
    }

    const attachments = await this.prismaService.attachment.findMany({
      where: {
        answerId,
      },
    });

    const answerAttachments: AnswerAttachment[] = [];

    for (const attachment of attachments) {
      const attachmentIdOrError = UniqueEntityId.createFromExistingId(
        attachment.id,
      );

      if (isLeft(attachmentIdOrError)) {
        continue;
      }

      answerAttachments.push(
        new AnswerAttachment({
          answerId: answerIdOrError.right,
          attachmentId: attachmentIdOrError.right,
        }),
      );
    }

    return answerAttachments;
  }
}
