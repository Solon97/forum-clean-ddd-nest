import { DomainEvent } from '@/shared/events/domain-event';
import { NotificationIntent } from '../notification-intent';

export interface NotificationEventStrategy<
  T extends DomainEvent = DomainEvent,
> {
  handle(event: T): Promise<NotificationIntent | null>;
}
