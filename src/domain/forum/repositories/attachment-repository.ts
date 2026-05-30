import { Attachment, AttachmentProps } from '../entities/attachment';

export interface AttachmentRepository {
  create(attachment: Attachment<AttachmentProps>): Promise<void>;
}
