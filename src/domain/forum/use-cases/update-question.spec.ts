import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';
import { makeQuestion } from '@test/factories/make-question';
import {
  assertEitherIsLeft,
  assertEitherIsRight,
} from '@test/helpers/assert-either';
import { assertSpyCalled, assertSpyNotCalled } from '@test/helpers/spy-helpers';
import { InMemoryQuestionAttachmentsRepository } from '@test/repositories/in-memory-question-attachment-repository';
import { InMemoryQuestionRepository } from '@test/repositories/in-memory-question-repository';
import { Mock } from 'vitest';
import { QuestionAttachment } from '../entities/question-attachment';
import { QuestionAttachmentsRepository } from '../repositories/question-attachments-repository';
import { QuestionRepository } from '../repositories/question-repository';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found';
import { UpdateQuestionUseCase } from './update-question';

let inMemoryQuestionRepository: QuestionRepository;
let inMemoryQuestionAttachmentsRepository: QuestionAttachmentsRepository;
let sut: UpdateQuestionUseCase;
let sutRepositorySpy: Mock<typeof inMemoryQuestionRepository.update>;

describe('Update Question', () => {
  beforeEach(() => {
    inMemoryQuestionRepository = new InMemoryQuestionRepository();
    inMemoryQuestionAttachmentsRepository =
      new InMemoryQuestionAttachmentsRepository();
    sut = new UpdateQuestionUseCase(
      inMemoryQuestionRepository,
      inMemoryQuestionAttachmentsRepository,
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
    const existingAttachment = new QuestionAttachment({
      questionId: exampleQuestion.id,
      attachmentId: new UniqueEntityId(),
    });
    const removedAttachment = new QuestionAttachment({
      questionId: exampleQuestion.id,
      attachmentId: new UniqueEntityId(),
    });
    const newAttachment = new QuestionAttachment({
      questionId: exampleQuestion.id,
      attachmentId: new UniqueEntityId(),
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
});
