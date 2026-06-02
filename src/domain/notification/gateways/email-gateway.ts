import { NotificationIntent } from '../notification-intent';

export interface EmailGateway {
  send(intent: NotificationIntent): Promise<void>;
}
