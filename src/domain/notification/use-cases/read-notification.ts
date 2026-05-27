import { Either, left, right } from 'fp-ts/lib/Either';
import { Notification } from '../entities/notification';
import { NotificationRepository } from '../repositories/notification-repository';
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found';

export interface ReadNotificationUseCaseInput {
  recipientId: string;
  notificationId: string;
}

export interface ReadNotificationUseCaseOutput {
  notification: Notification;
}

export class ReadNotificationUseCase {
  constructor(private notificationRepository: NotificationRepository) {}

  async execute({
    notificationId,
    recipientId,
  }: ReadNotificationUseCaseInput): Promise<
    Either<ResourceNotFoundError, ReadNotificationUseCaseOutput>
  > {
    const notification =
      await this.notificationRepository.findById(notificationId);

    if (!notification || notification.recipientId !== recipientId) {
      return left(new ResourceNotFoundError());
    }

    notification.markAsRead();
    await this.notificationRepository.update(notification);

    return right({
      notification,
    });
  }
}
