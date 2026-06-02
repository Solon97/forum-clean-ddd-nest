import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';
import { makeAnswer } from '@test/factories/make-answer';
import {
  assertEitherIsLeft,
  assertEitherIsRight,
} from '@test/helpers/assert-either';
import { assertSpyCalled, assertSpyNotCalled } from '@test/helpers/spy-helpers';
import { InMemoryAttachmentRepository } from '@test/repositories/in-memory-attachment-repository';
import { InMemoryAnswerAttachmentsRepository } from '@test/repositories/in-memory-answer-attachment-repository';
import { InMemoryAnswerRepository } from '@test/repositories/in-memory-answer-repository';
import { Mock } from 'vitest';
import { Attachment } from '../entities/attachment';
import { AnswerAttachment } from '../entities/answer-attachment';
import { AttachmentRepository } from '../repositories/attachment-repository';
import { AnswerAttachmentsRepository } from '../repositories/answer-attachments-repository';
import { AnswerRepository } from '../repositories/answer-repository';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found';
import { NotAllowedError } from '@/shared/errors/not-allowed';
import { UpdateAnswerUseCase } from './update-answer';

let inMemoryAnswerRepository: AnswerRepository;
let inMemoryAnswerAttachmentsRepository: AnswerAttachmentsRepository;
let inMemoryAttachmentRepository: AttachmentRepository;
let sut: UpdateAnswerUseCase;
let sutRepositorySpy: Mock<typeof inMemoryAnswerRepository.update>;

describe('Update Answer', () => {
  beforeEach(() => {
    inMemoryAnswerRepository = new InMemoryAnswerRepository();
    inMemoryAnswerAttachmentsRepository =
      new InMemoryAnswerAttachmentsRepository();
    inMemoryAttachmentRepository = new InMemoryAttachmentRepository(
      undefined,
      inMemoryAnswerAttachmentsRepository,
    );
    sut = new UpdateAnswerUseCase(
      inMemoryAnswerRepository,
      inMemoryAnswerAttachmentsRepository,
      inMemoryAttachmentRepository,
    );
    sutRepositorySpy = vi.spyOn(inMemoryAnswerRepository, 'update');
  });

  it('should be able to update a answer', async () => {
    vi.useFakeTimers();
    const now = new Date('2026-01-01T00:00:00.000Z');
    vi.setSystemTime(now);
    const exampleAnswer = makeAnswer();
    await inMemoryAnswerRepository.create(exampleAnswer);
    const originalCreatedAt = exampleAnswer.createdAt.getTime();
    const originalUpdatedAt = exampleAnswer.updatedAt?.getTime() ?? 0;
    vi.advanceTimersByTime(1000);
    const result = await sut.execute({
      answerId: exampleAnswer.id.toString(),
      authorId: exampleAnswer.authorId.toString(),
      content: 'Updated Content',
      attachmentIds: [],
    });
    assertEitherIsRight(result);
    assertSpyCalled(sutRepositorySpy, exampleAnswer);
    const updatedAnswer = await inMemoryAnswerRepository.findById(
      exampleAnswer.id.toString(),
    );
    expect(updatedAnswer).not.toBeNull();
    expect(updatedAnswer?.content).toBe('Updated Content');
    expect(updatedAnswer?.createdAt.getTime()).toBe(originalCreatedAt);
    expect(updatedAnswer?.updatedAt?.getTime()).toBeGreaterThan(
      originalUpdatedAt,
    );
  });

  it('should be able to update a answer with attachments', async () => {
    const exampleAnswer = makeAnswer();
    await inMemoryAnswerRepository.create(exampleAnswer);

    const existingAttachmentId = UniqueEntityId.create();
    const removedAttachmentId = UniqueEntityId.create();
    const newAttachmentId = UniqueEntityId.create();

    await inMemoryAttachmentRepository.create(
      new Attachment(
        {
          title: 'existing',
          url: 'https://example.com/existing.png',
          answerId: exampleAnswer.id,
        },
        existingAttachmentId,
      ),
    );

    await inMemoryAttachmentRepository.create(
      new Attachment(
        {
          title: 'removed',
          url: 'https://example.com/removed.png',
          answerId: exampleAnswer.id,
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

    const existingAttachment = new AnswerAttachment({
      answerId: exampleAnswer.id,
      attachmentId: existingAttachmentId,
    });
    const removedAttachment = new AnswerAttachment({
      answerId: exampleAnswer.id,
      attachmentId: removedAttachmentId,
    });
    const newAttachment = new AnswerAttachment({
      answerId: exampleAnswer.id,
      attachmentId: newAttachmentId,
    });

    inMemoryAnswerAttachmentsRepository.items.push(
      ...[existingAttachment, removedAttachment],
    );

    const updatedAttachmentIds = [
      existingAttachment.attachmentId.toString(),
      newAttachment.attachmentId.toString(),
    ];

    const result = await sut.execute({
      answerId: exampleAnswer.id.toString(),
      authorId: exampleAnswer.authorId.toString(),
      content: 'Updated Content',
      attachmentIds: updatedAttachmentIds,
    });
    assertEitherIsRight(result);
    assertSpyCalled(sutRepositorySpy, exampleAnswer);
    const updatedQuestion = result.right.answer;
    //? validate current attachments
    expect(updatedQuestion.attachments.currentItems).toHaveLength(2);
    const attachmentIds = updatedQuestion.attachments.currentItems.map((a) =>
      a.attachmentId.toString(),
    );
    expect(attachmentIds).toEqual(expect.arrayContaining(updatedAttachmentIds));
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

  it('should not be able to update a non existing answer', async () => {
    const result = await sut.execute({
      answerId: 'non-existing-answer-id',
      authorId: 'any-author-id',
      content: 'Content',
      attachmentIds: [],
    });
    assertEitherIsLeft(result);
    expect(result.left).toBeInstanceOf(ResourceNotFoundError);
    assertSpyNotCalled(sutRepositorySpy);
  });

  it('should not be able to update a answer from another author', async () => {
    const exampleAnswer = makeAnswer();
    await inMemoryAnswerRepository.create(exampleAnswer);
    const result = await sut.execute({
      answerId: exampleAnswer.id.toString(),
      authorId: 'other-author-id',
      content: 'Updated Content',
      attachmentIds: [],
    });
    assertEitherIsLeft(result);
    expect(result.left).toBeInstanceOf(ResourceNotFoundError);
    assertSpyNotCalled(sutRepositorySpy);
  });

  it('should ignore non-existing attachment ids on update', async () => {
    const exampleAnswer = makeAnswer();
    await inMemoryAnswerRepository.create(exampleAnswer);

    const result = await sut.execute({
      answerId: exampleAnswer.id.toString(),
      authorId: exampleAnswer.authorId.toString(),
      content: 'Updated Content',
      attachmentIds: [UniqueEntityId.create().toString()],
    });

    assertEitherIsRight(result);
    expect(result.right.answer.attachments.currentItems).toHaveLength(0);
  });

  it('should not update an answer with attachment linked to another aggregate', async () => {
    const exampleAnswer = makeAnswer();
    await inMemoryAnswerRepository.create(exampleAnswer);

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

    const result = await sut.execute({
      answerId: exampleAnswer.id.toString(),
      authorId: exampleAnswer.authorId.toString(),
      content: 'Updated Content',
      attachmentIds: [linkedAttachmentId.toString()],
    });

    assertEitherIsLeft(result);
    expect(result.left).toBeInstanceOf(NotAllowedError);
    assertSpyNotCalled(sutRepositorySpy);
  });
});
