import { Injectable, Logger } from '@nestjs/common';
import { EmailGateway } from '@/domain/notification/gateways/email-gateway';
import { NotificationIntent } from '@/domain/notification/notification-intent';

@Injectable()
export class ConsoleEmailGateway implements EmailGateway {
  private readonly logger = new Logger(ConsoleEmailGateway.name);

  async send(intent: NotificationIntent): Promise<void> {
    this.logger.log(
      `[email] to=${intent.recipientId} subject="${intent.subject}" body="${intent.body}"`,
    );
    return Promise.resolve();
  }
}
