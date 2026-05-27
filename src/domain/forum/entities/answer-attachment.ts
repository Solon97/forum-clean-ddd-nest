import { BaseEntity } from '@/shared/entities/base-entity';
import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';

export interface AnswerAttachmentProps {
  answerId: UniqueEntityId;
  attachmentId: UniqueEntityId;
}

export class AnswerAttachment extends BaseEntity<AnswerAttachmentProps> {
  get answerId() {
    return this.props.answerId;
  }

  get attachmentId() {
    return this.props.attachmentId;
  }
}
