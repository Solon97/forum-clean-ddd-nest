import { Either, left, right } from 'fp-ts/lib/Either';
import { Question } from '../entities/question';
import { QuestionRepository } from '../repositories/question-repository';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found';

interface GetQuestionBySlugUseCaseInput {
  slug: string;
}

interface GetQuestionBySlugUseCaseOutput {
  question: Question;
}

export class GetQuestionBySlugUseCase {
  constructor(private questionRepository: QuestionRepository) {}

  async execute({
    slug,
  }: GetQuestionBySlugUseCaseInput): Promise<
    Either<ResourceNotFoundError, GetQuestionBySlugUseCaseOutput>
  > {
    const question = await this.questionRepository.findBySlug(slug);
    if (!question) {
      return left(new ResourceNotFoundError());
    }
    return right({ question });
  }
}
