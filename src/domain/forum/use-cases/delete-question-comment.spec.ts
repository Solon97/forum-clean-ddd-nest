import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';
import {
  assertEitherIsLeft,
  assertEitherIsRight,
} from '@test/helpers/assert-either';
import { assertSpyCalled, assertSpyNotCalled } from '@test/helpers/spy-helpers';
import { InMemoryQuestionCommentRepository } from '@test/repositories/in-memory-question-comment-repository';
import { Mock } from 'vitest';
import { QuestionComment } from '../entities/comment';
import { QuestionCommentRepository } from '../repositories/question-comment-repository';
import { DeleteQuestionCommentUseCase } from './delete-question-comment';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found';

let inMemoryQuestionCommentRepository: QuestionCommentRepository;
let sut: DeleteQuestionCommentUseCase;
let sutRepositorySpy: Mock<typeof inMemoryQuestionCommentRepository.delete>;

describe('Delete Question Comment', () => {
  beforeEach(() => {
    inMemoryQuestionCommentRepository = new InMemoryQuestionCommentRepository();
    sut = new DeleteQuestionCommentUseCase(inMemoryQuestionCommentRepository);
    sutRepositorySpy = vi.spyOn(inMemoryQuestionCommentRepository, 'delete');
  });

  it('should be able to delete a question comment', async () => {
    const exampleComment = new QuestionComment({
      content: 'This is a question comment',
      authorId: new UniqueEntityId(),
      questionId: new UniqueEntityId(),
    });

    await inMemoryQuestionCommentRepository.create(exampleComment);

    const result = await sut.execute({
      commentId: exampleComment.id.toString(),
      authorId: exampleComment.authorId.toString(),
    });

    assertEitherIsRight(result);
    assertSpyCalled(sutRepositorySpy, exampleComment);

    const deletedComment = await inMemoryQuestionCommentRepository.findById(
      exampleComment.id.toString(),
    );

    expect(deletedComment).toBeNull();
  });

  it('should not be able to delete a non existing question comment', async () => {
    const result = await sut.execute({
      commentId: 'non-existing-comment-id',
      authorId: 'any-author-id',
    });

    assertEitherIsLeft(result);
    expect(result.left).toBeInstanceOf(ResourceNotFoundError);
    assertSpyNotCalled(sutRepositorySpy);
  });

  it('should not be able to delete a question comment from another author', async () => {
    const exampleComment = new QuestionComment({
      content: 'This is a question comment',
      authorId: new UniqueEntityId(),
      questionId: new UniqueEntityId(),
    });

    await inMemoryQuestionCommentRepository.create(exampleComment);

    const result = await sut.execute({
      commentId: exampleComment.id.toString(),
      authorId: 'other-author-id',
    });

    assertEitherIsLeft(result);
    expect(result.left).toBeInstanceOf(ResourceNotFoundError);
    assertSpyNotCalled(sutRepositorySpy);
  });
});
