import { QuestionComment } from '@/domain/forum/entities/comment';
import { QuestionCommentRepository } from '@/domain/forum/repositories/question-comment-repository';
import { PaginationParams } from '@/shared/repositories/pagination-params';
import { Injectable } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';
import { PrismaCommentMapper } from '../mappers/prisma-comment-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaQuestionCommentRepository implements QuestionCommentRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(comment: QuestionComment): Promise<void> {
    const data = PrismaCommentMapper.toPrismaQuestionComment(comment);
    await this.prismaService.comment.create({ data });
  }

  async findManyByQuestionId(
    params: PaginationParams,
    questionId: string,
  ): Promise<QuestionComment[]> {
    const comments = await this.prismaService.comment.findMany({
      where: {
        questionId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (params.page - 1) * (params.perPage ?? 20),
      take: params.perPage ?? 20,
    });

    return comments.reduce((acc, comment) => {
      const mappedComment =
        PrismaCommentMapper.toDomainQuestionComment(comment);
      if (isLeft(mappedComment)) {
        return acc;
      }

      return [...acc, mappedComment.right];
    }, [] as QuestionComment[]);
  }

  async findById(id: string): Promise<QuestionComment | null> {
    const comment = await this.prismaService.comment.findUnique({
      where: {
        id,
      },
    });

    if (!comment) {
      return null;
    }

    const mappedComment = PrismaCommentMapper.toDomainQuestionComment(comment);
    if (isLeft(mappedComment)) {
      return null;
    }

    return mappedComment.right;
  }

  async delete(comment: QuestionComment): Promise<void> {
    await this.prismaService.comment.delete({
      where: {
        id: comment.id.toString(),
      },
    });
  }
}
