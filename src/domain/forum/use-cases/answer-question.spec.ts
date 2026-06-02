import type { AnswerRepository } from '@/domain/forum/repositories/answer-repository';
import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';
import {
  assertEitherIsLeft,
  assertEitherIsRight,
} from '@test/helpers/assert-either';
import { assertSpyCalled } from '@test/helpers/spy-helpers';
import { InMemoryAttachmentRepository } from '@test/repositories/in-memory-attachment-repository';
import { InMemoryAnswerAttachmentsRepository } from '@test/repositories/in-memory-answer-attachment-repository';
import { InMemoryAnswerRepository } from '@test/repositories/in-memory-answer-repository';
import { Mock } from 'vitest';
import { Attachment } from '../entities/attachment';
import { AnswerAttachment } from '../entities/answer-attachment';
import type { AttachmentRepository } from '../repositories/attachment-repository';
import type { AnswerAttachmentsRepository } from '../repositories/answer-attachments-repository';
import { NotAllowedError } from '@/shared/errors/not-allowed';
import {
  AnswerQuestionUseCase,
  AnswerQuestionUseCaseInput,
} from './answer-question';

let inMemoryAnswerRepository: AnswerRepository;
let inMemoryAnswerAttachmentsRepository: AnswerAttachmentsRepository;
let inMemoryAttachmentRepository: AttachmentRepository;
let answerQuestionUseCase: AnswerQuestionUseCase;
let sutRepositorySpy: Mock<typeof inMemoryAnswerRepository.create>;

describe('Create Answer', () => {
  beforeEach(() => {
    inMemoryAnswerRepository = new InMemoryAnswerRepository();
    inMemoryAnswerAttachmentsRepository =
      new InMemoryAnswerAttachmentsRepository();
    inMemoryAttachmentRepository = new InMemoryAttachmentRepository(
      undefined,
      inMemoryAnswerAttachmentsRepository,
    );
    answerQuestionUseCase = new AnswerQuestionUseCase(
      inMemoryAnswerRepository,
      inMemoryAttachmentRepository,
    );
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
    const firstAttachmentId = UniqueEntityId.create();
    const secondAttachmentId = UniqueEntityId.create();

    await inMemoryAttachmentRepository.create(
      new Attachment(
        {
          title: 'first',
          url: 'https://example.com/first.png',
        },
        firstAttachmentId,
      ),
    );

    await inMemoryAttachmentRepository.create(
      new Attachment(
        {
          title: 'second',
          url: 'https://example.com/second.png',
        },
        secondAttachmentId,
      ),
    );

    const questionId = UniqueEntityId.create().toString();
    const authorId = UniqueEntityId.create().toString();
    const input: AnswerQuestionUseCaseInput = {
      questionId,
      authorId,
      content: 'This is an answer to the question.',
      attachmentIds: [
        firstAttachmentId.toString(),
        secondAttachmentId.toString(),
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

  test('should ignore non-existing attachment ids', async () => {
    const questionId = UniqueEntityId.create().toString();
    const authorId = UniqueEntityId.create().toString();
    const input: AnswerQuestionUseCaseInput = {
      questionId,
      authorId,
      content: 'This is an answer to the question.',
      attachmentIds: [UniqueEntityId.create().toString()],
    };

    const result = await answerQuestionUseCase.execute(input);

    assertEitherIsRight(result);
    expect(result.right.answer.attachments.currentItems).toHaveLength(0);
  });

  test('should not create an answer when attachment is already linked', async () => {
    const linkedAttachmentId = UniqueEntityId.create();
    await inMemoryAttachmentRepository.create(
      new Attachment(
        { title: 'linked', url: 'https://example.com/linked.png' },
        linkedAttachmentId,
      ),
    );
    inMemoryAnswerAttachmentsRepository.items.push(
      new AnswerAttachment({
        answerId: UniqueEntityId.create(),
        attachmentId: linkedAttachmentId,
      }),
    );

    const result = await answerQuestionUseCase.execute({
      questionId: UniqueEntityId.create().toString(),
      authorId: UniqueEntityId.create().toString(),
      content: 'This is an answer to the question.',
      attachmentIds: [linkedAttachmentId.toString()],
    });

    assertEitherIsLeft(result);
    expect(result.left).toBeInstanceOf(NotAllowedError);
  });
});
