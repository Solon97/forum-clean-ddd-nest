import { Question } from '@/domain/forum/entities/question';
import { QuestionRepository } from '@/domain/forum/repositories/question-repository';
import { PaginationParams } from '@/shared/repositories/pagination-params';
import { Injectable } from '@nestjs/common';
import { PrismaQuestionMapper } from '../mappers/prisma-question-mapper';
import { PrismaService } from '../prisma.service';
import { isLeft } from 'fp-ts/lib/Either';

@Injectable()
export class PrismaQuestionRepository implements QuestionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(question: Question): Promise<void> {
    const data = PrismaQuestionMapper.toPrisma(question);
    await this.prismaService.question.create({
      data,
    });
  }

  async update(question: Question): Promise<void> {
    const data = PrismaQuestionMapper.toPrisma(question);

    const newAttachmentIds = question.attachments.newItems.map((attachment) =>
      attachment.attachmentId.toString(),
    );

    const removedAttachmentIds = question.attachments.removedItems.map(
      (attachment) => attachment.attachmentId.toString(),
    );

    await this.prismaService.$transaction(async (tx) => {
      await tx.question.update({
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
          },
          data: {
            questionId: data.id,
          },
        });
      }

      if (removedAttachmentIds.length > 0) {
        await tx.attachment.updateMany({
          where: {
            id: {
              in: removedAttachmentIds,
            },
            questionId: data.id,
          },
          data: {
            questionId: null,
          },
        });
      }
    });
  }

  async findBySlug(slug: string): Promise<Question | null> {
    const question = await this.prismaService.question.findUnique({
      where: {
        slug,
      },
    });

    if (!question) {
      return null;
    }

    const mappedQuestion = PrismaQuestionMapper.toDomain(question);
    if (isLeft(mappedQuestion)) {
      return null;
    }

    return mappedQuestion.right;
  }

  async findManyRecent(params: PaginationParams): Promise<Question[]> {
    const questions = await this.prismaService.question.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      skip: (params.page - 1) * (params.perPage ?? 20),
      take: params.perPage ?? 20,
    });

    return questions.reduce((acc, question) => {
      const mappedQuestion = PrismaQuestionMapper.toDomain(question);
      if (isLeft(mappedQuestion)) {
        return acc;
      }

      return [...acc, mappedQuestion.right];
    }, [] as Question[]);
  }

  async findById(id: string): Promise<Question | null> {
    const question = await this.prismaService.question.findUnique({
      where: {
        id,
      },
    });

    if (!question) {
      return null;
    }

    const mappedQuestion = PrismaQuestionMapper.toDomain(question);
    if (isLeft(mappedQuestion)) {
      return null;
    }

    return mappedQuestion.right;
  }

  async delete(question: Question): Promise<void> {
    const data = PrismaQuestionMapper.toPrisma(question);
    await this.prismaService.question.delete({
      where: {
        id: data.id,
      },
    });
  }
}
