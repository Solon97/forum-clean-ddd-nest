import { BaseEntity } from '@/shared/entities/base-entity';
import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';
import { Optional } from '@/shared/types/optional';

export interface NotificationProps {
  title: string;
  content: string;
  recipientId: string;
  readAt?: Date;
  createdAt: Date;
}

export class Notification extends BaseEntity<NotificationProps> {
  constructor(
    props: Optional<NotificationProps, 'createdAt'>,
    id?: UniqueEntityId,
  ) {
    super(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }

  get title() {
    return this.props.title;
  }

  get content() {
    return this.props.content;
  }

  get recipientId() {
    return this.props.recipientId;
  }

  get readAt() {
    return this.props.readAt;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  markAsRead() {
    this.props.readAt = new Date();
  }
}
