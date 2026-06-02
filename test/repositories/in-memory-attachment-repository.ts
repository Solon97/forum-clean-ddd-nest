import {
  Attachment,
  AttachmentProps,
} from '@/domain/forum/entities/attachment';
import {
  AttachmentAvailabilityStatus,
  AttachmentRepository,
} from '@/domain/forum/repositories/attachment-repository';
import { QuestionAttachmentsRepository } from '@/domain/forum/repositories/question-attachments-repository';
import { AnswerAttachmentsRepository } from '@/domain/forum/repositories/answer-attachments-repository';

export class InMemoryAttachmentRepository implements AttachmentRepository {
  public items: Attachment<AttachmentProps>[] = [];

  constructor(
    private questionAttachmentsRepository?: QuestionAttachmentsRepository,
    private answerAttachmentsRepository?: AnswerAttachmentsRepository,
  ) {}

  create(attachment: Attachment<AttachmentProps>): Promise<void> {
    this.items.push(attachment);
    return Promise.resolve();
  }

  findManyAvailabilityStatusByIds(
    attachmentIds: string[],
  ): Promise<AttachmentAvailabilityStatus[]> {
    if (attachmentIds.length === 0) {
      return Promise.resolve([]);
    }

    const attachmentIdsSet = new Set(attachmentIds);

    return Promise.resolve(
      this.items
        .filter((item) => attachmentIdsSet.has(item.id.toString()))
        .map((item) => {
          const attachmentIdStr = item.id.toString();

          const questionAttachment =
            this.questionAttachmentsRepository?.items.find(
              (qa) => qa.attachmentId.toString() === attachmentIdStr,
            );

          const answerAttachment = this.answerAttachmentsRepository?.items.find(
            (aa) => aa.attachmentId.toString() === attachmentIdStr,
          );

          return {
            id: attachmentIdStr,
            questionId: questionAttachment?.questionId.toString() ?? null,
            answerId: answerAttachment?.answerId.toString() ?? null,
          };
        }),
    );
  }
}
