import {
  Attachment,
  AttachmentProps,
} from '@/domain/forum/entities/attachment';
import {
  AttachmentAvailabilityStatus,
  AttachmentRepository,
} from '@/domain/forum/repositories/attachment-repository';

export class InMemoryAttachmentRepository implements AttachmentRepository {
  public items: Attachment<AttachmentProps>[] = [];

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
        .map((item) => ({
          id: item.id.toString(),
          questionId: item.questionId?.toString() ?? null,
          answerId: item.answerId?.toString() ?? null,
        })),
    );
  }
}
