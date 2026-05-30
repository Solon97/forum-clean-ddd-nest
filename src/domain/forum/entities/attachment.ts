import { BaseEntity } from '@/shared/entities/base-entity';
import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';

export interface AttachmentProps {
  title: string;
  url: string;
  questionId?: UniqueEntityId;
  answerId?: UniqueEntityId;
}
export class Attachment<T extends AttachmentProps> extends BaseEntity<T> {
  get title() {
    return this.props.title;
  }

  get url() {
    return this.props.url;
  }

  get questionId() {
    return this.props.questionId;
  }

  get answerId() {
    return this.props.answerId;
  }
}
