import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';
import { makeAnswer } from '@test/factories/make-answer';
import {
  assertEitherIsLeft,
  assertEitherIsRight,
} from '@test/helpers/assert-either';
import { assertSpyCalled, assertSpyNotCalled } from '@test/helpers/spy-helpers';
import { InMemoryAnswerCommentRepository } from '@test/repositories/in-memory-answer-comment-repository';
import { InMemoryAnswerRepository } from '@test/repositories/in-memory-answer-repository';
import { Mock } from 'vitest';
import { AnswerCommentRepository } from '../repositories/answer-comment-repository';
import { AnswerRepository } from '../repositories/answer-repository';
import {
  CommentOnAnswerUseCase,
  CommentOnAnswerUseCaseInput,
} from './comment-on-answer';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found';

let inMemoryAnswerRepository: AnswerRepository;
let inMemoryAnswerCommentRepository: AnswerCommentRepository;
let sut: CommentOnAnswerUseCase;
let sutRepositorySpy: Mock<typeof inMemoryAnswerCommentRepository.create>;

describe('Comment On Answer', () => {
  beforeEach(() => {
    inMemoryAnswerCommentRepository = new InMemoryAnswerCommentRepository();
    inMemoryAnswerRepository = new InMemoryAnswerRepository();
    sut = new CommentOnAnswerUseCase(
      inMemoryAnswerRepository,
      inMemoryAnswerCommentRepository,
    );
    sutRepositorySpy = vi.spyOn(inMemoryAnswerCommentRepository, 'create');
  });

  it('should be able to comment on a answer', async () => {
    const exampleAnswer = makeAnswer();
    await inMemoryAnswerRepository.create(exampleAnswer);
    const input: CommentOnAnswerUseCaseInput = {
      content: 'This is a comment',
      answerId: exampleAnswer.id.toString(),
      authorId: new UniqueEntityId().toString(),
    };

    const result = await sut.execute(input);

    assertEitherIsRight(result);
    assertSpyCalled(sutRepositorySpy);
    expect(result.right.comment.id).toBeTruthy();
    expect(result.right.comment.content).toBe('This is a comment');
    expect(result.right.comment.answerId.toString()).toBe(
      exampleAnswer.id.toString(),
    );
    expect(result.right.comment.authorId.toString()).toBe(input.authorId);
  });

  it('should not be able to comment on a non existing answer', async () => {
    const result = await sut.execute({
      content: 'This is a comment',
      answerId: 'non-existing-answer-id',
      authorId: 'any-author-id',
    });

    assertEitherIsLeft(result);
    expect(result.left).toBeInstanceOf(ResourceNotFoundError);
    assertSpyNotCalled(sutRepositorySpy);
  });
});
