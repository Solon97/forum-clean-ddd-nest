import { DomainEvent } from '@/shared/events/domain-event';
import { NotificationEventStrategy } from './notification-event-strategy';

export class NotificationStrategyRegistry {
  private readonly strategies = new Map<string, NotificationEventStrategy>();

  register(eventName: string, strategy: NotificationEventStrategy): void {
    this.strategies.set(eventName, strategy);
  }

  resolve(event: DomainEvent): NotificationEventStrategy | undefined {
    return this.strategies.get(event.constructor.name);
  }
}
