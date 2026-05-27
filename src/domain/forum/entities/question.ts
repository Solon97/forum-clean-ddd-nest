import { AggregateRoot } from '@/shared/entities/aggregate-root';
import { BaseEntity, Timestamps } from '@/shared/entities/base-entity';
import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id/index';
import { Optional } from '@/shared/types/optional';
import { QuestionAttachmentList } from './question-attachment-list';
import { Slug } from './value-objects/slug/index';
import { SetQuestionBestAnswerEvent } from './events/set-question-best-answer-event';

export interface QuestionProps {
  authorId: UniqueEntityId;
  bestAnswerId?: UniqueEntityId | undefined;
  attachments: QuestionAttachmentList;
  title: string;
  content: string;
  slug: Slug;
}

export class Question extends AggregateRoot<QuestionProps & Timestamps> {
  constructor(
    props: Optional<QuestionProps, 'slug' | 'attachments'> &
      Partial<Timestamps>,
    id?: UniqueEntityId,
  ) {
    const slug = props.slug || Slug.createFromText(props.title);
    const propsWithTimestamps = BaseEntity.setPropsTimestamps({
      ...props,
      slug,
      attachments: props.attachments || new QuestionAttachmentList(),
    });
    super(propsWithTimestamps, id);
  }

  get title() {
    return this.props.title;
  }

  get content() {
    return this.props.content;
  }

  get slug() {
    return this.props.slug;
  }

  get authorId() {
    return this.props.authorId;
  }

  get bestAnswerId() {
    return this.props.bestAnswerId;
  }

  get excerptTitle() {
    return this.props.title
      .substring(0, 20)
      .trimEnd()
      .concat(this.props.title.length > 20 ? '...' : '');
  }

  get excerptContent() {
    return this.content
      .substring(0, 120)
      .trimEnd()
      .concat(this.content.length > 120 ? '...' : '');
  }

  get attachments() {
    return this.props.attachments;
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

  set title(title: string) {
    this.props.title = title;
    this.props.slug = Slug.createFromText(title);
    this.touch();
  }

  set bestAnswerId(bestAnswerId: UniqueEntityId | undefined) {
    if (
      bestAnswerId &&
      (!this.props.bestAnswerId ||
        !bestAnswerId.equals(this.props.bestAnswerId))
    ) {
      this.addDomainEvent(new SetQuestionBestAnswerEvent(this, bestAnswerId));
    }
    this.props.bestAnswerId = bestAnswerId;
    this.touch();
  }

  set attachments(attachments: QuestionAttachmentList) {
    this.props.attachments = attachments;
    this.touch();
  }
}
