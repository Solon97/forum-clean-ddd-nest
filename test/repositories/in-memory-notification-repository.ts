import { Notification } from '@/domain/notification/entities/notification';
import { NotificationRepository } from '@/domain/notification/repositories/notification-repository';

export class InMemoryNotificationRepository implements NotificationRepository {
  private items: Notification[] = [];

  create(notification: Notification): Promise<void> {
    this.items.push(notification);
    return Promise.resolve();
  }

  findById(id: string): Promise<Notification | null> {
    const notification = this.items.find((item) => item.id.value === id);
    return Promise.resolve(notification ?? null);
  }

  update(notification: Notification): Promise<void> {
    const index = this.items.findIndex(
      (item) => item.id.value === notification.id.value,
    );

    if (index !== -1) {
      this.items[index] = notification;
    }

    return Promise.resolve();
  }
}
