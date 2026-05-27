import { BaseEntity } from '@/shared/entities/base-entity';
import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';

export interface QuestionAttachmentProps {
  questionId: UniqueEntityId;
  attachmentId: UniqueEntityId;
}

export class QuestionAttachment extends BaseEntity<QuestionAttachmentProps> {
  get questionId() {
    return this.props.questionId;
  }

  get attachmentId() {
    return this.props.attachmentId;
  }
}
