import {
  Attachment,
  AttachmentProps,
} from '@/domain/forum/entities/attachment';
import { AttachmentRepository } from '@/domain/forum/repositories/attachment-repository';

export class InMemoryAttachmentRepository implements AttachmentRepository {
  public items: Attachment<AttachmentProps>[] = [];

  create(attachment: Attachment<AttachmentProps>): Promise<void> {
    this.items.push(attachment);
    return Promise.resolve();
  }
}
