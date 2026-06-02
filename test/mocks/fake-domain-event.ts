import { DomainEvent } from '@/shared/events/domain-event';
import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';

export class FakeDomainEvent implements DomainEvent {
  readonly occurredAt = new Date();
  getAggregateId() {
    return UniqueEntityId.create();
  }
}
