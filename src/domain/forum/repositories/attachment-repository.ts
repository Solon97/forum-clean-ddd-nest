import { Attachment, AttachmentProps } from '../entities/attachment';

export interface AttachmentAvailabilityStatus {
  id: string;
  questionId: string | null;
  answerId: string | null;
}

export interface AttachmentRepository {
  create(attachment: Attachment<AttachmentProps>): Promise<void>;
  findManyAvailabilityStatusByIds(
    attachmentIds: string[],
  ): Promise<AttachmentAvailabilityStatus[]>;
}
