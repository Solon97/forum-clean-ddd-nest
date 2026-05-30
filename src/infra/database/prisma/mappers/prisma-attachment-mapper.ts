import {
  Attachment,
  AttachmentProps,
} from '@/domain/forum/entities/attachment';
import { AttachmentUncheckedCreateInput } from '../generated/models';

export class PrismaAttachmentMapper {
  static toPrisma(
    attachment: Attachment<AttachmentProps>,
  ): AttachmentUncheckedCreateInput {
    return {
      id: attachment.id.toString(),
      title: attachment.title,
      url: attachment.url,
      questionId: null,
      answerId: null,
    };
  }
}
