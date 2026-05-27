import { makeQuestion } from '@test/factories/make-question';
import {
  assertEitherIsLeft,
  assertEitherIsRight,
} from '@test/helpers/assert-either';
import { assertSpyCalled, assertSpyNotCalled } from '@test/helpers/spy-helpers';
import { InMemoryQuestionRepository } from '@test/repositories/in-memory-question-repository';
import { Mock } from 'vitest';
import { QuestionRepository } from '../repositories/question-repository';
import { DeleteQuestionUseCase } from './delete-question';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found';

let inMemoryQuestionRepository: QuestionRepository;
let sut: DeleteQuestionUseCase;
let sutRepositorySpy: Mock<typeof inMemoryQuestionRepository.delete>;

describe('Delete Question', () => {
  beforeEach(() => {
    inMemoryQuestionRepository = new InMemoryQuestionRepository();
    sut = new DeleteQuestionUseCase(inMemoryQuestionRepository);
    sutRepositorySpy = vi.spyOn(inMemoryQuestionRepository, 'delete');
  });

  it('should be able to delete a question', async () => {
    const exampleQuestion = makeQuestion();
    await inMemoryQuestionRepository.create(exampleQuestion);
    const result = await sut.execute({
      questionId: exampleQuestion.id.toString(),
      authorId: exampleQuestion.authorId.toString(),
    });
    assertEitherIsRight(result);
    assertSpyCalled(sutRepositorySpy, exampleQuestion);
    const deletedQuestion = await inMemoryQuestionRepository.findById(
      exampleQuestion.id.toString(),
    );
    expect(deletedQuestion).toBeNull();
  });

  it('should not be able to delete a non existing question', async () => {
    const result = await sut.execute({
      questionId: 'non-existing-question-id',
      authorId: 'any-author-id',
    });
    assertEitherIsLeft(result);
    expect(result.left).toBeInstanceOf(ResourceNotFoundError);
    assertSpyNotCalled(sutRepositorySpy);
  });

  it('should not be able to delete a question from another author', async () => {
    const exampleQuestion = makeQuestion();
    await inMemoryQuestionRepository.create(exampleQuestion);
    const result = await sut.execute({
      questionId: exampleQuestion.id.toString(),
      authorId: 'other-author-id',
    });
    assertEitherIsLeft(result);
    expect(result.left).toBeInstanceOf(ResourceNotFoundError);
    assertSpyNotCalled(sutRepositorySpy);
  });
});
