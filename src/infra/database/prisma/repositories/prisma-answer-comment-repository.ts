import { AnswerComment } from '@/domain/forum/entities/comment';
import { AnswerCommentRepository } from '@/domain/forum/repositories/answer-comment-repository';
import { PaginationParams } from '@/shared/repositories/pagination-params';
import { Injectable } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';
import { PrismaCommentMapper } from '../mappers/prisma-comment-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaAnswerCommentRepository implements AnswerCommentRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(comment: AnswerComment): Promise<void> {
    const data = PrismaCommentMapper.toPrismaAnswerComment(comment);
    await this.prismaService.comment.create({ data });
  }

  async findManyByAnswerId(
    params: PaginationParams,
    answerId: string,
  ): Promise<AnswerComment[]> {
    const comments = await this.prismaService.comment.findMany({
      where: {
        answerId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (params.page - 1) * (params.perPage ?? 20),
      take: params.perPage ?? 20,
    });

    return comments.reduce((acc, comment) => {
      const mappedComment = PrismaCommentMapper.toDomainAnswerComment(comment);
      if (isLeft(mappedComment)) {
        return acc;
      }

      return [...acc, mappedComment.right];
    }, [] as AnswerComment[]);
  }

  async findById(id: string): Promise<AnswerComment | null> {
    const comment = await this.prismaService.comment.findUnique({
      where: {
        id,
      },
    });

    if (!comment) {
      return null;
    }

    const mappedComment = PrismaCommentMapper.toDomainAnswerComment(comment);
    if (isLeft(mappedComment)) {
      return null;
    }

    return mappedComment.right;
  }

  async delete(comment: AnswerComment): Promise<void> {
    await this.prismaService.comment.delete({
      where: {
        id: comment.id.toString(),
      },
    });
  }
}
