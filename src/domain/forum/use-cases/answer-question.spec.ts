import type { AnswerRepository } from '@/domain/forum/repositories/answer-repository';
import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';
import { assertEitherIsRight } from '@test/helpers/assert-either';
import { assertSpyCalled } from '@test/helpers/spy-helpers';
import { InMemoryAnswerRepository } from '@test/repositories/in-memory-answer-repository';
import { Mock } from 'vitest';
import {
  AnswerQuestionUseCase,
  AnswerQuestionUseCaseInput,
} from './answer-question';

let inMemoryAnswerRepository: AnswerRepository;
let answerQuestionUseCase: AnswerQuestionUseCase;
let sutRepositorySpy: Mock<typeof inMemoryAnswerRepository.create>;

describe('Create Answer', () => {
  beforeEach(() => {
    inMemoryAnswerRepository = new InMemoryAnswerRepository();
    answerQuestionUseCase = new AnswerQuestionUseCase(inMemoryAnswerRepository);
    sutRepositorySpy = vi.spyOn(inMemoryAnswerRepository, 'create');
  });

  test('should be able to create an answer', async () => {
    const questionId = UniqueEntityId.create().toString();
    const authorId = UniqueEntityId.create().toString();
    const input: AnswerQuestionUseCaseInput = {
      questionId,
      authorId,
      content: 'This is an answer to the question.',
      attachmentIds: [],
    };

    const result = await answerQuestionUseCase.execute(input);

    assertEitherIsRight(result);
    assertSpyCalled(sutRepositorySpy);
    expect(result).toBeTruthy();
    expect(result.right.answer.id).toBeTruthy();
    expect(result.right.answer.content).toBe(input.content);
    expect(result.right.answer.questionId.toString()).toBe(input.questionId);
    expect(result.right.answer.authorId.toString()).toBe(input.authorId);
    expect(result.right.answer.attachments.currentItems).toEqual([]);
  });

  test('should be able to create an answer with attachments', async () => {
    const questionId = UniqueEntityId.create().toString();
    const authorId = UniqueEntityId.create().toString();
    const input: AnswerQuestionUseCaseInput = {
      questionId,
      authorId,
      content: 'This is an answer to the question.',
      attachmentIds: [
        UniqueEntityId.create().toString(),
        UniqueEntityId.create().toString(),
      ],
    };

    const result = await answerQuestionUseCase.execute(input);

    assertEitherIsRight(result);
    assertSpyCalled(sutRepositorySpy);
    expect(result).toBeTruthy();
    expect(result.right.answer.attachments.currentItems).toHaveLength(2);
    expect(
      result.right.answer.attachments.currentItems[0]?.attachmentId.toString(),
    ).toBe(input.attachmentIds[0]);
    expect(
      result.right.answer.attachments.currentItems[1]?.attachmentId.toString(),
    ).toBe(input.attachmentIds[1]);
  });
});
