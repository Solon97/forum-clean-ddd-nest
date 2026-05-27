import { PaginationParams } from '@/shared/repositories/pagination-params';
import { Either, right } from 'fp-ts/lib/Either';
import { Answer } from '../entities/answer';
import { AnswerRepository } from '../repositories/answer-repository';

interface FetchQuestionAnswersUseCaseInput {
  paginationParams: PaginationParams;
  questionId: string;
}

interface FetchQuestionAnswersUseCaseOutput {
  answers: Answer[];
}

export class FetchQuestionAnswersUseCase {
  constructor(private answerRepository: AnswerRepository) {}

  async execute({
    paginationParams,
    questionId,
  }: FetchQuestionAnswersUseCaseInput): Promise<
    Either<never, FetchQuestionAnswersUseCaseOutput>
  > {
    const answers = await this.answerRepository.findManyByQuestionId(
      paginationParams,
      questionId,
    );
    return right({
      answers,
    });
  }
}
