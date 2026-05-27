import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';
import { assertSpyCalled, assertSpyNotCalled } from '@test/helpers/spy-helpers';
import {
  assertEitherIsLeft,
  assertEitherIsRight,
} from '@test/helpers/assert-either';
import { InMemoryAnswerCommentRepository } from '@test/repositories/in-memory-answer-comment-repository';
import { Mock } from 'vitest';
import { AnswerComment } from '../entities/comment';
import { AnswerCommentRepository } from '../repositories/answer-comment-repository';
import { DeleteAnswerCommentUseCase } from './delete-answer-comment';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found';

let inMemoryAnswerCommentRepository: AnswerCommentRepository;
let sut: DeleteAnswerCommentUseCase;
let sutRepositorySpy: Mock<typeof inMemoryAnswerCommentRepository.delete>;

describe('Delete Answer Comment', () => {
  beforeEach(() => {
    inMemoryAnswerCommentRepository = new InMemoryAnswerCommentRepository();
    sut = new DeleteAnswerCommentUseCase(inMemoryAnswerCommentRepository);
    sutRepositorySpy = vi.spyOn(inMemoryAnswerCommentRepository, 'delete');
  });

  it('should be able to delete a answer comment', async () => {
    const exampleComment = new AnswerComment({
      content: 'This is an answer comment',
      authorId: new UniqueEntityId(),
      answerId: new UniqueEntityId(),
    });

    await inMemoryAnswerCommentRepository.create(exampleComment);

    const result = await sut.execute({
      commentId: exampleComment.id.toString(),
      authorId: exampleComment.authorId.toString(),
    });

    assertEitherIsRight(result);
    assertSpyCalled(sutRepositorySpy, exampleComment);

    const deletedComment = await inMemoryAnswerCommentRepository.findById(
      exampleComment.id.toString(),
    );

    expect(deletedComment).toBeNull();
  });

  it('should not be able to delete a non existing answer comment', async () => {
    const result = await sut.execute({
      commentId: 'non-existing-comment-id',
      authorId: 'any-author-id',
    });

    assertEitherIsLeft(result);
    expect(result.left).toBeInstanceOf(ResourceNotFoundError);
    assertSpyNotCalled(sutRepositorySpy);
  });

  it('should not be able to delete a answer comment from another author', async () => {
    const exampleComment = new AnswerComment({
      content: 'This is an answer comment',
      authorId: new UniqueEntityId(),
      answerId: new UniqueEntityId(),
    });

    await inMemoryAnswerCommentRepository.create(exampleComment);

    const result = await sut.execute({
      commentId: exampleComment.id.toString(),
      authorId: 'other-author-id',
    });

    assertEitherIsLeft(result);
    expect(result.left).toBeInstanceOf(ResourceNotFoundError);
    assertSpyNotCalled(sutRepositorySpy);
  });
});
