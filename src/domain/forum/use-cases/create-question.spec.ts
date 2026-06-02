import { Mock } from 'vitest';
import { InMemoryQuestionRepository } from '@test/repositories/in-memory-question-repository';
import { InMemoryQuestionAttachmentsRepository } from '@test/repositories/in-memory-question-attachment-repository';
import { InMemoryAttachmentRepository } from '@test/repositories/in-memory-attachment-repository';
import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';
import { QuestionRepository } from '../repositories/question-repository';
import { QuestionAttachmentsRepository } from '../repositories/question-attachments-repository';
import { AttachmentRepository } from '../repositories/attachment-repository';
import {
  CreateQuestionUseCase,
  CreateQuestionUseCaseInput,
} from './create-question';
import { assertSpyCalled } from '@test/helpers/spy-helpers';
import {
  assertEitherIsLeft,
  assertEitherIsRight,
} from '@test/helpers/assert-either';
import { Attachment } from '../entities/attachment';
import { QuestionAttachment } from '../entities/question-attachment';
import { NotAllowedError } from '@/shared/errors/not-allowed';

let inMemoryQuestionRepository: QuestionRepository;
let inMemoryQuestionAttachmentsRepository: QuestionAttachmentsRepository;
let inMemoryAttachmentRepository: AttachmentRepository;
let sut: CreateQuestionUseCase;
let sutRepositorySpy: Mock<typeof inMemoryQuestionRepository.create>;

describe('Create Question', () => {
  beforeEach(() => {
    inMemoryQuestionRepository = new InMemoryQuestionRepository();
    inMemoryQuestionAttachmentsRepository =
      new InMemoryQuestionAttachmentsRepository();
    inMemoryAttachmentRepository = new InMemoryAttachmentRepository(
      inMemoryQuestionAttachmentsRepository,
    );
    sut = new CreateQuestionUseCase(
      inMemoryQuestionRepository,
      inMemoryAttachmentRepository,
    );
    sutRepositorySpy = vi.spyOn(inMemoryQuestionRepository, 'create');
  });

  it('should create a question', async () => {
    const input: CreateQuestionUseCaseInput = {
      authorId: UniqueEntityId.create().toString(),
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
    const attachmentId = UniqueEntityId.create();
    await inMemoryAttachmentRepository.create(
      new Attachment(
        {
          title: 'attachment',
          url: 'https://example.com/attachment.png',
        },
        attachmentId,
      ),
    );

    const input: CreateQuestionUseCaseInput = {
      authorId: UniqueEntityId.create().toString(),
      title: 'How to implement DDD in a forum application?',
      content:
        'I want to learn how to implement DDD in a forum application. Any tips?',
      attachmentIds: [attachmentId.toString()],
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

  it('should ignore non-existing attachment ids', async () => {
    const input: CreateQuestionUseCaseInput = {
      authorId: UniqueEntityId.create().toString(),
      title: 'How to implement DDD in a forum application?',
      content:
        'I want to learn how to implement DDD in a forum application. Any tips?',
      attachmentIds: [UniqueEntityId.create().toString()],
    };

    const result = await sut.execute(input);

    assertEitherIsRight(result);
    expect(result.right.question.attachments.currentItems).toHaveLength(0);
  });

  it('should not create a question when attachment is already linked', async () => {
    const attachmentId = UniqueEntityId.create();
    await inMemoryAttachmentRepository.create(
      new Attachment(
        { title: 'attachment', url: 'https://example.com/attachment.png' },
        attachmentId,
      ),
    );
    inMemoryQuestionAttachmentsRepository.items.push(
      new QuestionAttachment({
        questionId: UniqueEntityId.create(),
        attachmentId,
      }),
    );

    const input: CreateQuestionUseCaseInput = {
      authorId: UniqueEntityId.create().toString(),
      title: 'How to implement DDD in a forum application?',
      content:
        'I want to learn how to implement DDD in a forum application. Any tips?',
      attachmentIds: [attachmentId.toString()],
    };

    const result = await sut.execute(input);

    assertEitherIsLeft(result);
    expect(result.left).toBeInstanceOf(NotAllowedError);
  });
});
