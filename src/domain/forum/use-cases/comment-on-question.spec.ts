import { makeQuestion } from '@test/factories/make-question';
import { assertSpyCalled, assertSpyNotCalled } from '@test/helpers/spy-helpers';
import {
  assertEitherIsLeft,
  assertEitherIsRight,
} from '@test/helpers/assert-either';
import { InMemoryQuestionCommentRepository } from '@test/repositories/in-memory-question-comment-repository';
import { InMemoryQuestionRepository } from '@test/repositories/in-memory-question-repository';
import { Mock } from 'vitest';
import { QuestionCommentRepository } from '../repositories/question-comment-repository';
import { QuestionRepository } from '../repositories/question-repository';
import {
  CommentOnQuestionUseCase,
  CommentOnQuestionUseCaseInput,
} from './comment-on-question';
import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found';

let inMemoryQuestionRepository: QuestionRepository;
let inMemoryQuestionCommentRepository: QuestionCommentRepository;
let sut: CommentOnQuestionUseCase;
let sutRepositorySpy: Mock<typeof inMemoryQuestionCommentRepository.create>;

describe('Comment On Question', () => {
  beforeEach(() => {
    inMemoryQuestionCommentRepository = new InMemoryQuestionCommentRepository();
    inMemoryQuestionRepository = new InMemoryQuestionRepository();
    sut = new CommentOnQuestionUseCase(
      inMemoryQuestionRepository,
      inMemoryQuestionCommentRepository,
    );
    sutRepositorySpy = vi.spyOn(inMemoryQuestionCommentRepository, 'create');
  });

  it('should be able to comment on a question', async () => {
    const exampleQuestion = makeQuestion();
    await inMemoryQuestionRepository.create(exampleQuestion);
    const input: CommentOnQuestionUseCaseInput = {
      content: 'This is a comment',
      questionId: exampleQuestion.id.toString(),
      authorId: new UniqueEntityId().toString(),
    };

    const result = await sut.execute(input);

    assertSpyCalled(sutRepositorySpy);
    assertEitherIsRight(result);
    expect(result.right.comment.id).toBeTruthy();
    expect(result.right.comment.content).toBe('This is a comment');
    expect(result.right.comment.questionId.toString()).toBe(
      exampleQuestion.id.toString(),
    );
    expect(result.right.comment.authorId.toString()).toBe(input.authorId);
  });

  it('should not be able to comment on a non existing question', async () => {
    const result = await sut.execute({
      content: 'This is a comment',
      questionId: 'non-existing-question-id',
      authorId: 'any-author-id',
    });
    assertEitherIsLeft(result);
    expect(result.left).toBeInstanceOf(ResourceNotFoundError);
    assertSpyNotCalled(sutRepositorySpy);
  });
});
