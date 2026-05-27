import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';
import { DomainEvent } from '@/shared/events/domain-event';
import { Question } from '../question';

export class SetQuestionBestAnswerEvent implements DomainEvent {
  readonly occurredAt: Date;
  readonly question: Question;
  readonly bestAnswerId: UniqueEntityId;

  constructor(question: Question, bestAnswerId: UniqueEntityId) {
    this.occurredAt = new Date();
    this.question = question;
    this.bestAnswerId = bestAnswerId;
  }

  getAggregateId(): UniqueEntityId {
    return this.question.id;
  }
}
