import { BaseEntity } from '@/shared/entities/base-entity';

export interface AttachmentProps {
  title: string;
  url: string;
}
export class Attachment<T extends AttachmentProps> extends BaseEntity<T> {
  get title() {
    return this.props.title;
  }

  get url() {
    return this.props.url;
  }
}
