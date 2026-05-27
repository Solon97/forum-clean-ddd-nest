import { Either, right } from 'fp-ts/lib/Either';
import { NotificationRepository } from '../repositories/notification-repository';
import { Notification } from '../entities/notification';

export interface SendNotificationUseCaseInput {
  title: string;
  content: string;
  recipientId: string;
}

export interface SendNotificationUseCaseOutput {
  notification: Notification;
}

export class SendNotificationUseCase {
  constructor(private notificationRepository: NotificationRepository) {}

  async execute(
    input: SendNotificationUseCaseInput,
  ): Promise<Either<undefined, SendNotificationUseCaseOutput>> {
    const notification = new Notification({
      title: input.title,
      content: input.content,
      recipientId: input.recipientId,
    });

    await this.notificationRepository.create(notification);

    return right({
      notification,
    });
  }
}
