import { NotificationIntent } from '../notification-intent';
import { NotificationEventStrategy } from '../strategies/notification-event-strategy';
import { NotificationStrategyRegistry } from '../strategies/notification-strategy-registry';
import { DispatchNotificationUseCase } from './dispatch-notification-use-case';
import { FakeEmailGateway } from '@test/mocks/fake-email-gateway';
import { FakeDomainEvent } from '@test/mocks/fake-domain-event';

class FakeStrategy implements NotificationEventStrategy<FakeDomainEvent> {
  constructor(private readonly intent: NotificationIntent | null) {}
  async handle(): Promise<NotificationIntent | null> {
    return Promise.resolve(this.intent);
  }
}

let registry: NotificationStrategyRegistry;
let emailGateway: FakeEmailGateway;
let useCase: DispatchNotificationUseCase;

describe('DispatchNotificationUseCase', () => {
  beforeEach(() => {
    registry = new NotificationStrategyRegistry();
    emailGateway = new FakeEmailGateway();
    useCase = new DispatchNotificationUseCase(registry, emailGateway);
  });

  it('should send email when strategy returns an intent', async () => {
    const intent: NotificationIntent = {
      recipientId: 'user-1',
      subject: 'Test',
      body: 'Body',
    };
    registry.register('FakeDomainEvent', new FakeStrategy(intent));

    await useCase.execute(new FakeDomainEvent());

    expect(emailGateway.sent).toHaveLength(1);
    expect(emailGateway.sent[0]).toEqual(intent);
  });

  it('should not send email when strategy returns null (skip)', async () => {
    registry.register('FakeDomainEvent', new FakeStrategy(null));

    await useCase.execute(new FakeDomainEvent());

    expect(emailGateway.sent).toHaveLength(0);
  });

  it('should do nothing for unmapped events', async () => {
    await useCase.execute(new FakeDomainEvent());

    expect(emailGateway.sent).toHaveLength(0);
  });
});
