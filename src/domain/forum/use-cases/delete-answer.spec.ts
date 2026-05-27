import { makeAnswer } from '@test/factories/make-answer';
import {
  assertEitherIsLeft,
  assertEitherIsRight,
} from '@test/helpers/assert-either';
import { assertSpyCalled, assertSpyNotCalled } from '@test/helpers/spy-helpers';
import { InMemoryAnswerRepository } from '@test/repositories/in-memory-answer-repository';
import { Mock } from 'vitest';
import { AnswerRepository } from '../repositories/answer-repository';
import { DeleteAnswerUseCase } from './delete-answer';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found';

let inMemoryAnswerRepository: AnswerRepository;
let sut: DeleteAnswerUseCase;
let sutRepositorySpy: Mock<typeof inMemoryAnswerRepository.delete>;

describe('Delete Answer', () => {
  beforeEach(() => {
    inMemoryAnswerRepository = new InMemoryAnswerRepository();
    sut = new DeleteAnswerUseCase(inMemoryAnswerRepository);
    sutRepositorySpy = vi.spyOn(inMemoryAnswerRepository, 'delete');
  });

  it('should be able to delete a answer', async () => {
    const exampleAnswer = makeAnswer();
    await inMemoryAnswerRepository.create(exampleAnswer);
    const result = await sut.execute({
      answerId: exampleAnswer.id.toString(),
      authorId: exampleAnswer.authorId.toString(),
    });
    assertEitherIsRight(result);
    assertSpyCalled(sutRepositorySpy, exampleAnswer);
    const deletedAnswer = await inMemoryAnswerRepository.findById(
      exampleAnswer.id.toString(),
    );
    expect(deletedAnswer).toBeNull();
  });

  it('should not be able to delete a non existing answer', async () => {
    const result = await sut.execute({
      answerId: 'non-existing-answer-id',
      authorId: 'any-author-id',
    });
    assertEitherIsLeft(result);
    expect(result.left).toBeInstanceOf(ResourceNotFoundError);
    assertSpyNotCalled(sutRepositorySpy);
  });

  it('should not be able to delete a answer from another author', async () => {
    const exampleAnswer = makeAnswer();
    await inMemoryAnswerRepository.create(exampleAnswer);
    const result = await sut.execute({
      answerId: exampleAnswer.id.toString(),
      authorId: 'other-author-id',
    });
    assertEitherIsLeft(result);
    expect(result.left).toBeInstanceOf(ResourceNotFoundError);
    assertSpyNotCalled(sutRepositorySpy);
  });
});
