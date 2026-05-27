import { UniqueEntityId } from './index';

test('should be able to create a unique entity ID', () => {
  const uniqueEntityId = new UniqueEntityId();
  expect(uniqueEntityId.value).toBeDefined();
});

test('should be able to create a unique entity ID with a custom value', () => {
  const uniqueEntityId = new UniqueEntityId(
    '123e4567-e89b-12d3-a456-426614174000',
  );
  expect(uniqueEntityId.value).toBe('123e4567-e89b-12d3-a456-426614174000');
});

test('should throw an error when trying to create a unique entity ID with an invalid value', () => {
  expect(() => {
    new UniqueEntityId('invalid-uuid');
  }).toThrow('Invalid Unique Entity ID');
});
