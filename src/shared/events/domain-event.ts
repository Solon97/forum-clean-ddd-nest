import { UniqueEntityId } from '../entities/value-objects/unique-entity-id';

export interface DomainEvent {
  occurredAt: Date;
  getAggregateId(): UniqueEntityId;
}
