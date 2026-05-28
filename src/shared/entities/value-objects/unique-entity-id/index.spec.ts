import { isLeft, isRight } from 'fp-ts/lib/Either';
import { UniqueEntityId } from './index';

test('should be able to create a unique entity ID', () => {
  const uniqueEntityId = UniqueEntityId.create();
  expect(uniqueEntityId.value).toBeDefined();
});

test('should be able to create a unique entity ID from an existing value', () => {
  const result = UniqueEntityId.createFromExistingId(
    '123e4567-e89b-12d3-a456-426614174000',
  );
  expect(isRight(result)).toBe(true);
  if (isRight(result)) {
    expect(result.right.value).toBe('123e4567-e89b-12d3-a456-426614174000');
  }
});

test('should return Left when trying to create a unique entity ID with an invalid value', () => {
  const result = UniqueEntityId.createFromExistingId('invalid-uuid');
  expect(isLeft(result)).toBe(true);
});
