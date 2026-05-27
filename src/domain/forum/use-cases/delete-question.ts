import { Either, left, right } from 'fp-ts/lib/Either';
import { QuestionRepository } from '../repositories/question-repository';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found';

interface DeleteQuestionUseCaseInput {
  questionId: string;
  authorId: string;
}

export class DeleteQuestionUseCase {
  constructor(private questionRepository: QuestionRepository) {}

  async execute({
    questionId,
    authorId,
  }: DeleteQuestionUseCaseInput): Promise<
    Either<ResourceNotFoundError, undefined>
  > {
    const question = await this.questionRepository.findById(questionId);
    if (!question || question.authorId.toString() !== authorId) {
      return left(new ResourceNotFoundError());
    }
    await this.questionRepository.delete(question);
    return right(undefined);
  }
}
