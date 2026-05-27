import { BaseEntity, Timestamps } from '@/shared/entities/base-entity';
import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';

export interface CommentProps {
  content: string;
  authorId: UniqueEntityId;
}

abstract class Comment<T extends CommentProps> extends BaseEntity<
  T & Timestamps
> {
  constructor(props: T & Partial<Timestamps>, id?: UniqueEntityId) {
    const propsWithTimestamps = BaseEntity.setPropsTimestamps(props);
    super(propsWithTimestamps, id);
  }

  get authorId() {
    return this.props.authorId;
  }

  get content() {
    return this.props.content;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  set content(content: string) {
    this.props.content = content;
    this.touch();
  }
}

export class QuestionComment extends Comment<
  { questionId: UniqueEntityId } & CommentProps
> {
  get questionId() {
    return this.props.questionId;
  }
}

export class AnswerComment extends Comment<
  { answerId: UniqueEntityId } & CommentProps
> {
  get answerId() {
    return this.props.answerId;
  }
}
