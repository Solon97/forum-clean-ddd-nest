import { PaginationParams } from '@/shared/repositories/pagination-params';
import { Either, right } from 'fp-ts/lib/Either';
import { AnswerComment } from '../entities/comment';
import { AnswerCommentRepository } from '../repositories/answer-comment-repository';

interface FetchAnswerCommentsUseCaseInput {
  paginationParams: PaginationParams;
  answerId: string;
}

interface FetchAnswerCommentsUseCaseOutput {
  comments: AnswerComment[];
}

export class FetchAnswerCommentsUseCase {
  constructor(private answerCommentRepository: AnswerCommentRepository) {}

  async execute({
    paginationParams,
    answerId,
  }: FetchAnswerCommentsUseCaseInput): Promise<
    Either<never, FetchAnswerCommentsUseCaseOutput>
  > {
    const comments = await this.answerCommentRepository.findManyByAnswerId(
      paginationParams,
      answerId,
    );

    return right({
      comments,
    });
  }
}
