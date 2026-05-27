import { Notification } from '../entities/notification';

export interface NotificationRepository {
  create(notification: Notification): Promise<void>;
  findById(id: string): Promise<Notification | null>;
  update(notification: Notification): Promise<void>;
}
