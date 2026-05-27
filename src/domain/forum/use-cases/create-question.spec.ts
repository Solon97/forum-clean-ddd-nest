import { Mock } from 'vitest';
import { InMemoryQuestionRepository } from '@test/repositories/in-memory-question-repository';
import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';
import { QuestionRepository } from '../repositories/question-repository';
import {
  CreateQuestionUseCase,
  CreateQuestionUseCaseInput,
} from './create-question';
import { assertSpyCalled } from '@test/helpers/spy-helpers';
import { assertEitherIsRight } from '@test/helpers/assert-either';

let inMemoryQuestionRepository: QuestionRepository;
let sut: CreateQuestionUseCase;
let sutRepositorySpy: Mock<typeof inMemoryQuestionRepository.create>;

describe('Create Question', () => {
  beforeEach(() => {
    inMemoryQuestionRepository = new InMemoryQuestionRepository();
    sut = new CreateQuestionUseCase(inMemoryQuestionRepository);
    sutRepositorySpy = vi.spyOn(inMemoryQuestionRepository, 'create');
  });

  it('should create a question', async () => {
    const input: CreateQuestionUseCaseInput = {
      authorId: new UniqueEntityId().toString(),
      title: 'How to implement DDD in a forum application?',
      content:
        'I want to learn how to implement DDD in a forum application. Any tips?',
      attachmentIds: [],
    };

    const result = await sut.execute(input);

    assertEitherIsRight(result);
    assertSpyCalled(sutRepositorySpy);
    expect(result.right.question).toBeTruthy();
    expect(result.right.question.id).toBeTruthy();
    expect(result.right.question.authorId.toString()).toBe(input.authorId);
    expect(result.right.question.title).toBe(input.title);
    expect(result.right.question.content).toBe(input.content);
    expect(result.right.question.createdAt).toBeTruthy();
    expect(result.right.question.updatedAt).toBeTruthy();
    expect(result.right.question.attachments.currentItems).toEqual([]);
  });

  it('should create a question with attachments', async () => {
    const input: CreateQuestionUseCaseInput = {
      authorId: new UniqueEntityId().toString(),
      title: 'How to implement DDD in a forum application?',
      content:
        'I want to learn how to implement DDD in a forum application. Any tips?',
      attachmentIds: [new UniqueEntityId().toString()],
    };

    const result = await sut.execute(input);

    assertEitherIsRight(result);
    assertSpyCalled(sutRepositorySpy);
    expect(result.right.question).toBeTruthy();
    expect(result.right.question.attachments.currentItems).toHaveLength(1);
    expect(
      result.right.question.attachments.currentItems[0]?.attachmentId.toString(),
    ).toBe(input.attachmentIds[0]);
  });
});
