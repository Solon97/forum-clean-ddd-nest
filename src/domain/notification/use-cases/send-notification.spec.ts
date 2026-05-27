import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';
import { assertEitherIsRight } from '@test/helpers/assert-either';
import { assertSpyCalled } from '@test/helpers/spy-helpers';
import { InMemoryNotificationRepository } from '@test/repositories/in-memory-notification-repository';
import { Mock } from 'vitest';
import { NotificationRepository } from '../repositories/notification-repository';
import {
  SendNotificationUseCase,
  SendNotificationUseCaseInput,
} from './send-notification';

let inMemoryNotificationRepository: NotificationRepository;
let sut: SendNotificationUseCase;
let sutRepositorySpy: Mock<typeof inMemoryNotificationRepository.create>;

describe('Send Notification', () => {
  beforeEach(() => {
    inMemoryNotificationRepository = new InMemoryNotificationRepository();
    sut = new SendNotificationUseCase(inMemoryNotificationRepository);
    sutRepositorySpy = vi.spyOn(inMemoryNotificationRepository, 'create');
  });

  it('should send a notification', async () => {
    const input: SendNotificationUseCaseInput = {
      recipientId: new UniqueEntityId().toString(),
      title: 'A new answer was posted on your question',
      content: 'A student answered your question about DDD aggregates.',
    };

    const result = await sut.execute(input);

    assertEitherIsRight(result);
    assertSpyCalled(sutRepositorySpy);
    expect(result.right.notification).toBeTruthy();
    expect(result.right.notification.id).toBeTruthy();
    expect(result.right.notification.recipientId).toBe(input.recipientId);
    expect(result.right.notification.title).toBe(input.title);
    expect(result.right.notification.content).toBe(input.content);
    expect(result.right.notification.createdAt).toBeTruthy();
    expect(result.right.notification.readAt).toBeUndefined();
  });
});
