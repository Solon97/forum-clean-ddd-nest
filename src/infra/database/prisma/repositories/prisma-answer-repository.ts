import { Answer } from '@/domain/forum/entities/answer';
import { AnswerRepository } from '@/domain/forum/repositories/answer-repository';
import { PaginationParams } from '@/shared/repositories/pagination-params';
import { Injectable } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';
import { PrismaAnswerMapper } from '../mappers/prisma-answer-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaAnswerRepository implements AnswerRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(answer: Answer): Promise<void> {
    const data = PrismaAnswerMapper.toPrisma(answer);
    const attachmentIds = answer.attachments.currentItems.map((attachment) =>
      attachment.attachmentId.toString(),
    );

    await this.prismaService.$transaction(async (tx) => {
      await tx.answer.create({
        data,
      });

      if (attachmentIds.length > 0) {
        await tx.attachment.updateMany({
          where: {
            id: {
              in: attachmentIds,
            },
            answerId: null,
            questionId: null,
          },
          data: {
            answerId: data.id,
          },
        });
      }
    });
  }

  async update(answer: Answer): Promise<void> {
    const data = PrismaAnswerMapper.toPrisma(answer);

    const newAttachmentIds = answer.attachments.newItems.map((attachment) =>
      attachment.attachmentId.toString(),
    );

    const removedAttachmentIds = answer.attachments.removedItems.map(
      (attachment) => attachment.attachmentId.toString(),
    );

    await this.prismaService.$transaction(async (tx) => {
      await tx.answer.update({
        where: {
          id: data.id,
        },
        data,
      });

      if (newAttachmentIds.length > 0) {
        await tx.attachment.updateMany({
          where: {
            id: {
              in: newAttachmentIds,
            },
            questionId: null,
            OR: [{ answerId: null }, { answerId: data.id }],
          },
          data: {
            answerId: data.id,
          },
        });
      }

      if (removedAttachmentIds.length > 0) {
        await tx.attachment.updateMany({
          where: {
            id: {
              in: removedAttachmentIds,
            },
            answerId: data.id,
          },
          data: {
            answerId: null,
          },
        });
      }
    });
  }

  async findById(id: string): Promise<Answer | null> {
    const answer = await this.prismaService.answer.findUnique({
      where: {
        id,
      },
    });

    if (!answer) {
      return null;
    }

    const mappedAnswer = PrismaAnswerMapper.toDomain(answer);
    if (isLeft(mappedAnswer)) {
      return null;
    }

    return mappedAnswer.right;
  }

  async findManyByQuestionId(
    params: PaginationParams,
    questionId: string,
  ): Promise<Answer[]> {
    const answers = await this.prismaService.answer.findMany({
      where: {
        questionId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (params.page - 1) * (params.perPage ?? 20),
      take: params.perPage ?? 20,
    });

    return answers.reduce((acc, answer) => {
      const mappedAnswer = PrismaAnswerMapper.toDomain(answer);
      if (isLeft(mappedAnswer)) {
        return acc;
      }

      return [...acc, mappedAnswer.right];
    }, [] as Answer[]);
  }

  async delete(answer: Answer): Promise<void> {
    const data = PrismaAnswerMapper.toPrisma(answer);
    await this.prismaService.$transaction(async (tx) => {
      await tx.attachment.updateMany({
        where: {
          answerId: data.id,
        },
        data: {
          answerId: null,
        },
      });

      await tx.answer.delete({
        where: {
          id: data.id,
        },
      });
    });
  }
}
