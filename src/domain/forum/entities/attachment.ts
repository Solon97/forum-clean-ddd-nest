import { BaseEntity, Timestamps } from '@/shared/entities/base-entity';
import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';

export interface AttachmentProps {
  fileName: string;
  fileUrl: string;
}
export class Attachment<T extends AttachmentProps> extends BaseEntity<
  T & Timestamps
> {
  constructor(props: T & Partial<Timestamps>, id?: UniqueEntityId) {
    const propsWithTimestamps = BaseEntity.setPropsTimestamps(props);
    super(propsWithTimestamps, id);
  }

  get fileName() {
    return this.props.fileName;
  }

  get fileUrl() {
    return this.props.fileUrl;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }
}
