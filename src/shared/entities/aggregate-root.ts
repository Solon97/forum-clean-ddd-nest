import { DomainEvent } from '../events/domain-event';
import { DomainEvents } from '../events/domain-events';
import { BaseEntity } from './base-entity';

export abstract class AggregateRoot<
  TProps extends object,
> extends BaseEntity<TProps> {
  private _domainEvents: DomainEvent[] = [];

  get domainEvents(): DomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent);
    DomainEvents.markAggregateForDispatch(this);
  }

  public clearEvents() {
    this._domainEvents = [];
  }
}
