import { PaginationParams } from '@/shared/repositories/pagination-params';
import { Either, right } from 'fp-ts/lib/Either';
import { QuestionComment } from '../entities/comment';
import { QuestionCommentRepository } from '../repositories/question-comment-repository';

interface FetchQuestionCommentsUseCaseInput {
  paginationParams: PaginationParams;
  questionId: string;
}

interface FetchQuestionCommentsUseCaseOutput {
  comments: QuestionComment[];
}

export class FetchQuestionCommentsUseCase {
  constructor(private questionCommentRepository: QuestionCommentRepository) {}

  async execute({
    paginationParams,
    questionId,
  }: FetchQuestionCommentsUseCaseInput): Promise<
    Either<never, FetchQuestionCommentsUseCaseOutput>
  > {
    const comments = await this.questionCommentRepository.findManyByQuestionId(
      paginationParams,
      questionId,
    );

    return right({
      comments,
    });
  }
}
