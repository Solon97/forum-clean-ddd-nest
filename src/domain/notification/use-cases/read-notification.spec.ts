import { Notification } from '@/domain/notification/entities/notification';
import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';
import {
  assertEitherIsLeft,
  assertEitherIsRight,
} from '@test/helpers/assert-either';
import { assertSpyCalled, assertSpyNotCalled } from '@test/helpers/spy-helpers';
import { InMemoryNotificationRepository } from '@test/repositories/in-memory-notification-repository';
import { Mock } from 'vitest';
import { NotificationRepository } from '../repositories/notification-repository';
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found';
import { ReadNotificationUseCase } from './read-notification';

let inMemoryNotificationRepository: NotificationRepository;
let sut: ReadNotificationUseCase;
let sutRepositorySpy: Mock<typeof inMemoryNotificationRepository.update>;

describe('Read Notification', () => {
  beforeEach(() => {
    inMemoryNotificationRepository = new InMemoryNotificationRepository();
    sut = new ReadNotificationUseCase(inMemoryNotificationRepository);
    sutRepositorySpy = vi.spyOn(inMemoryNotificationRepository, 'update');
  });

  it('should be able to read a notification', async () => {
    vi.useFakeTimers();
    const now = new Date('2026-01-01T00:00:00.000Z');
    vi.setSystemTime(now);

    const recipientId = new UniqueEntityId().toString();
    const notification = new Notification({
      recipientId,
      title: 'A new answer was posted on your question',
      content: 'A student answered your question about DDD aggregates.',
    });

    await inMemoryNotificationRepository.create(notification);

    vi.advanceTimersByTime(1000);

    const result = await sut.execute({
      notificationId: notification.id.toString(),
      recipientId,
    });

    assertEitherIsRight(result);
    assertSpyCalled(sutRepositorySpy, notification);

    const updatedNotification = await inMemoryNotificationRepository.findById(
      notification.id.toString(),
    );

    expect(updatedNotification).not.toBeNull();
    expect(updatedNotification?.readAt).toBeTruthy();
    expect(updatedNotification?.readAt?.getTime()).toBeGreaterThan(
      now.getTime(),
    );
  });

  it('should not be able to read a non existing notification', async () => {
    const result = await sut.execute({
      notificationId: 'non-existing-notification-id',
      recipientId: 'any-recipient-id',
    });

    assertEitherIsLeft(result);
    expect(result.left).toBeInstanceOf(ResourceNotFoundError);
    assertSpyNotCalled(sutRepositorySpy);
  });

  it('should not be able to read a notification from another recipient', async () => {
    const notification = new Notification({
      recipientId: new UniqueEntityId().toString(),
      title: 'A new answer was posted on your question',
      content: 'A student answered your question about DDD aggregates.',
    });

    await inMemoryNotificationRepository.create(notification);

    const result = await sut.execute({
      notificationId: notification.id.toString(),
      recipientId: 'other-recipient-id',
    });

    assertEitherIsLeft(result);
    expect(result.left).toBeInstanceOf(ResourceNotFoundError);
    assertSpyNotCalled(sutRepositorySpy);
  });
});
