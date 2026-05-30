import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';
import { makeQuestion } from '@test/factories/make-question';
import {
  assertEitherIsLeft,
  assertEitherIsRight,
} from '@test/helpers/assert-either';
import { assertSpyCalled, assertSpyNotCalled } from '@test/helpers/spy-helpers';
import { InMemoryQuestionAttachmentsRepository } from '@test/repositories/in-memory-question-attachment-repository';
import { InMemoryAttachmentRepository } from '@test/repositories/in-memory-attachment-repository';
import { InMemoryQuestionRepository } from '@test/repositories/in-memory-question-repository';
import { Mock } from 'vitest';
import { Attachment } from '../entities/attachment';
import { QuestionAttachment } from '../entities/question-attachment';
import { AttachmentRepository } from '../repositories/attachment-repository';
import { QuestionAttachmentsRepository } from '../repositories/question-attachments-repository';
import { QuestionRepository } from '../repositories/question-repository';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found';
import { NotAllowedError } from '@/shared/errors/not-allowed';
import { UpdateQuestionUseCase } from './update-question';

let inMemoryQuestionRepository: QuestionRepository;
let inMemoryQuestionAttachmentsRepository: QuestionAttachmentsRepository;
let inMemoryAttachmentRepository: AttachmentRepository;
let sut: UpdateQuestionUseCase;
let sutRepositorySpy: Mock<typeof inMemoryQuestionRepository.update>;

describe('Update Question', () => {
  beforeEach(() => {
    inMemoryQuestionRepository = new InMemoryQuestionRepository();
    inMemoryQuestionAttachmentsRepository =
      new InMemoryQuestionAttachmentsRepository();
    inMemoryAttachmentRepository = new InMemoryAttachmentRepository();
    sut = new UpdateQuestionUseCase(
      inMemoryQuestionRepository,
      inMemoryQuestionAttachmentsRepository,
      inMemoryAttachmentRepository,
    );
    sutRepositorySpy = vi.spyOn(inMemoryQuestionRepository, 'update');
  });

  it('should be able to update a question', async () => {
    vi.useFakeTimers();
    const now = new Date('2026-01-01T00:00:00.000Z');
    vi.setSystemTime(now);
    const exampleQuestion = makeQuestion();
    await inMemoryQuestionRepository.create(exampleQuestion);
    const originalCreatedAt = exampleQuestion.createdAt.getTime();
    const originalUpdatedAt = exampleQuestion.updatedAt?.getTime() ?? 0;
    vi.advanceTimersByTime(1000);
    const result = await sut.execute({
      questionId: exampleQuestion.id.toString(),
      authorId: exampleQuestion.authorId.toString(),
      title: 'Updated Title',
      content: 'Updated Content',
      attachmentIds: [],
    });
    assertEitherIsRight(result);
    assertSpyCalled(sutRepositorySpy, exampleQuestion);
    const updatedQuestion = await inMemoryQuestionRepository.findById(
      exampleQuestion.id.toString(),
    );
    expect(updatedQuestion).not.toBeNull();
    expect(updatedQuestion?.title).toBe('Updated Title');
    expect(updatedQuestion?.content).toBe('Updated Content');
    expect(updatedQuestion?.createdAt.getTime()).toBe(originalCreatedAt);
    expect(updatedQuestion?.updatedAt?.getTime()).toBeGreaterThan(
      originalUpdatedAt,
    );
  });

  it('should be able to update a question with attachments', async () => {
    const exampleQuestion = makeQuestion();
    await inMemoryQuestionRepository.create(exampleQuestion);

    const existingAttachmentId = UniqueEntityId.create();
    const removedAttachmentId = UniqueEntityId.create();
    const newAttachmentId = UniqueEntityId.create();

    await inMemoryAttachmentRepository.create(
      new Attachment(
        {
          title: 'existing',
          url: 'https://example.com/existing.png',
          questionId: exampleQuestion.id,
        },
        existingAttachmentId,
      ),
    );

    await inMemoryAttachmentRepository.create(
      new Attachment(
        {
          title: 'removed',
          url: 'https://example.com/removed.png',
          questionId: exampleQuestion.id,
        },
        removedAttachmentId,
      ),
    );

    await inMemoryAttachmentRepository.create(
      new Attachment(
        {
          title: 'new',
          url: 'https://example.com/new.png',
        },
        newAttachmentId,
      ),
    );

    const existingAttachment = new QuestionAttachment({
      questionId: exampleQuestion.id,
      attachmentId: existingAttachmentId,
    });
    const removedAttachment = new QuestionAttachment({
      questionId: exampleQuestion.id,
      attachmentId: removedAttachmentId,
    });
    const newAttachment = new QuestionAttachment({
      questionId: exampleQuestion.id,
      attachmentId: newAttachmentId,
    });
    inMemoryQuestionAttachmentsRepository.items.push(
      ...[existingAttachment, removedAttachment],
    );
    const newAttachmentIds = [
      existingAttachment.attachmentId.toString(),
      newAttachment.attachmentId.toString() ?? '',
    ];

    const result = await sut.execute({
      questionId: exampleQuestion.id.toString(),
      authorId: exampleQuestion.authorId.toString(),
      title: 'Updated Title',
      content: 'Updated Content',
      attachmentIds: newAttachmentIds,
    });

    assertEitherIsRight(result);
    assertSpyCalled(sutRepositorySpy, exampleQuestion);

    const updatedQuestion = result.right.question;
    //? validate current attachments
    expect(updatedQuestion.attachments.currentItems).toHaveLength(2);
    const attachmentIds = updatedQuestion.attachments.currentItems.map((a) =>
      a.attachmentId.toString(),
    );
    expect(attachmentIds).toEqual(expect.arrayContaining(newAttachmentIds));
    //? validate removed attachments
    expect(updatedQuestion.attachments.removedItems).toHaveLength(1);
    expect(
      updatedQuestion.attachments.removedItems[0]?.attachmentId.toString(),
    ).toBe(removedAttachment.attachmentId.toString());
    //? validate new attachments
    expect(updatedQuestion.attachments.newItems).toHaveLength(1);
    expect(
      updatedQuestion.attachments.newItems[0]?.attachmentId.toString(),
    ).toBe(newAttachment.attachmentId.toString());
  });

  it('should not be able to update a non existing question', async () => {
    const result = await sut.execute({
      questionId: 'non-existing-question-id',
      authorId: 'any-author-id',
      title: 'Title',
      content: 'Content',
      attachmentIds: [],
    });
    assertEitherIsLeft(result);
    expect(result.left).toBeInstanceOf(ResourceNotFoundError);
    assertSpyNotCalled(sutRepositorySpy);
  });

  it('should not be able to update a question from another author', async () => {
    const exampleQuestion = makeQuestion();
    await inMemoryQuestionRepository.create(exampleQuestion);
    const result = await sut.execute({
      questionId: exampleQuestion.id.toString(),
      authorId: 'other-author-id',
      title: 'Updated Title',
      content: 'Updated Content',
      attachmentIds: [],
    });
    assertEitherIsLeft(result);
    expect(result.left).toBeInstanceOf(ResourceNotFoundError);
    assertSpyNotCalled(sutRepositorySpy);
  });

  it('should ignore non-existing attachment ids on update', async () => {
    const exampleQuestion = makeQuestion();
    await inMemoryQuestionRepository.create(exampleQuestion);

    const result = await sut.execute({
      questionId: exampleQuestion.id.toString(),
      authorId: exampleQuestion.authorId.toString(),
      title: 'Updated Title',
      content: 'Updated Content',
      attachmentIds: [UniqueEntityId.create().toString()],
    });

    assertEitherIsRight(result);
    expect(result.right.question.attachments.currentItems).toHaveLength(0);
  });

  it('should not update a question with attachment linked to another aggregate', async () => {
    const exampleQuestion = makeQuestion();
    await inMemoryQuestionRepository.create(exampleQuestion);

    const linkedAttachmentId = UniqueEntityId.create();
    await inMemoryAttachmentRepository.create(
      new Attachment(
        {
          title: 'linked',
          url: 'https://example.com/linked.png',
          questionId: UniqueEntityId.create(),
        },
        linkedAttachmentId,
      ),
    );

    const result = await sut.execute({
      questionId: exampleQuestion.id.toString(),
      authorId: exampleQuestion.authorId.toString(),
      title: 'Updated Title',
      content: 'Updated Content',
      attachmentIds: [linkedAttachmentId.toString()],
    });

    assertEitherIsLeft(result);
    expect(result.left).toBeInstanceOf(NotAllowedError);
    assertSpyNotCalled(sutRepositorySpy);
  });
});
