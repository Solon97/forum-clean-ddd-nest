import { AggregateRoot } from '../entities/aggregate-root';
import { UniqueEntityId } from '../entities/value-objects/unique-entity-id';
import { DomainEvent } from './domain-event';

type DomainEventCallback<T extends DomainEvent = DomainEvent> = (
  event: T,
) => Promise<void>;

export class DomainEvents {
  private static handlersMap: Record<string, DomainEventCallback[]> = {};
  private static markedAggregates: AggregateRoot<object>[] = [];

  public static markAggregateForDispatch(aggregate: AggregateRoot<object>) {
    const aggregateFound = !!this.findMarkedAggregateByID(aggregate.id);

    if (!aggregateFound) {
      this.markedAggregates.push(aggregate);
    }
  }

  private static async dispatchAggregateEvents(
    aggregate: AggregateRoot<object>,
  ) {
    for (const event of aggregate.domainEvents) {
      await this.dispatch(event);
    }
  }

  private static removeAggregateFromMarkedDispatchList(
    aggregate: AggregateRoot<object>,
  ) {
    const index = this.markedAggregates.findIndex((a) => a.equals(aggregate));

    this.markedAggregates.splice(index, 1);
  }

  private static findMarkedAggregateByID(
    id: UniqueEntityId,
  ): AggregateRoot<object> | undefined {
    return this.markedAggregates.find((aggregate) => aggregate.id.equals(id));
  }

  public static async dispatchEventsForAggregate(id: UniqueEntityId) {
    const aggregate = this.findMarkedAggregateByID(id);

    if (aggregate) {
      await this.dispatchAggregateEvents(aggregate);
      aggregate.clearEvents();
      this.removeAggregateFromMarkedDispatchList(aggregate);
    }
  }

  public static register<T extends DomainEvent>(
    callback: DomainEventCallback<T>,
    eventClassName: string,
  ) {
    const wasEventRegisteredBefore = eventClassName in this.handlersMap;

    if (!wasEventRegisteredBefore) {
      this.handlersMap[eventClassName] = [];
    }
    this.handlersMap[eventClassName]?.push((event) => callback(event as T));
  }

  public static clearHandlers() {
    this.handlersMap = {};
  }

  public static clearMarkedAggregates() {
    this.markedAggregates = [];
  }

  private static async dispatch(event: DomainEvent) {
    const eventClassName: string = event.constructor.name;

    const isEventRegistered = eventClassName in this.handlersMap;

    if (isEventRegistered) {
      const handlers = this.handlersMap[eventClassName] || [];

      for (const handler of handlers) {
        await handler(event);
      }
    }
  }
}
