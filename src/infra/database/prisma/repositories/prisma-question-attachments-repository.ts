import { QuestionAttachment } from '@/domain/forum/entities/question-attachment';
import { QuestionAttachmentsRepository } from '@/domain/forum/repositories/question-attachments-repository';
import { InvalidUniqueEntityIdError } from '@/shared/entities/value-objects/unique-entity-id';
import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id/index';
import { Injectable } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaQuestionAttachmentsRepository implements QuestionAttachmentsRepository {
  items: QuestionAttachment[] = [];

  constructor(private readonly prismaService: PrismaService) {}

  async findManyByQuestionId(
    questionId: string,
  ): Promise<QuestionAttachment[]> {
    const questionIdOrError = UniqueEntityId.createFromExistingId(questionId);
    if (isLeft(questionIdOrError)) {
      throw new InvalidUniqueEntityIdError('Question');
    }

    const attachments = await this.prismaService.attachment.findMany({
      where: {
        questionId,
      },
    });

    const questionAttachments: QuestionAttachment[] = [];

    for (const attachment of attachments) {
      const attachmentIdOrError = UniqueEntityId.createFromExistingId(
        attachment.id,
      );
      if (isLeft(attachmentIdOrError)) {
        continue;
      }

      questionAttachments.push(
        new QuestionAttachment({
          questionId: questionIdOrError.right,
          attachmentId: attachmentIdOrError.right,
        }),
      );
    }

    return questionAttachments;
  }
}
