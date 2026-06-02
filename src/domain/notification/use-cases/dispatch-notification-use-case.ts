import { DomainEvent } from '@/shared/events/domain-event';
import { EmailGateway } from '../gateways/email-gateway';
import { NotificationStrategyRegistry } from '../strategies/notification-strategy-registry';

export class DispatchNotificationUseCase {
  constructor(
    private readonly registry: NotificationStrategyRegistry,
    private readonly emailGateway: EmailGateway,
  ) {}

  async execute(event: DomainEvent): Promise<void> {
    const strategy = this.registry.resolve(event);
    if (!strategy) return;

    const intent = await strategy.handle(event);
    if (!intent) return;

    await this.emailGateway.send(intent);
  }
}
