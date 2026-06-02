import { EmailGateway } from '@/domain/notification/gateways/email-gateway';
import { NotificationIntent } from '@/domain/notification/notification-intent';

export class FakeEmailGateway implements EmailGateway {
  readonly sent: NotificationIntent[] = [];

  async send(intent: NotificationIntent): Promise<void> {
    this.sent.push(intent);
    return Promise.resolve();
  }
}
