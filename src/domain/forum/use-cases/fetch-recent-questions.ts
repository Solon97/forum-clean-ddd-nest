import { PaginationParams } from '@/shared/repositories/pagination-params';
import { Either, right } from 'fp-ts/lib/Either';
import { Question } from '../entities/question';
import { QuestionRepository } from '../repositories/question-repository';

interface FetchRecentQuestionsUseCaseInput {
  paginationParams: PaginationParams;
}

interface FetchRecentQuestionsUseCaseOutput {
  questions: Question[];
}

export class FetchRecentQuestionsUseCase {
  constructor(private questionRepository: QuestionRepository) {}

  async execute({
    paginationParams,
  }: FetchRecentQuestionsUseCaseInput): Promise<
    Either<never, FetchRecentQuestionsUseCaseOutput>
  > {
    const questions =
      await this.questionRepository.findManyRecent(paginationParams);
    return right({
      questions,
    });
  }
}
