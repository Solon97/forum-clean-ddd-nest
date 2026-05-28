import { isLeft, isRight } from 'fp-ts/lib/Either';
import { Slug } from './index';

test('should be able to create a slug from a text', () => {
  const slug = Slug.createFromText('Hello World!');
  expect(slug.value).toBe('hello-world');
});

test('should be able to create a slug from a text with multiple spaces', () => {
  const slug = Slug.createFromText('  Hello   World!  ');
  expect(slug.value).toBe('hello-world');
});

test('should be able to create a slug from a text with special characters', () => {
  const slug = Slug.createFromText('Hello @ World!');
  expect(slug.value).toBe('hello-world');
});

test('should be able to create a slug from a text with multiple hyphens', () => {
  const slug = Slug.createFromText('Hello -- World!');
  expect(slug.value).toBe('hello-world');
});

test('should be able to create a slug from a text with leading and trailing hyphens', () => {
  const slug = Slug.createFromText('  -Hello World!-  ');
  expect(slug.value).toBe('hello-world');
});

test('should be able to create a slug from an existing slug', () => {
  const result = Slug.createFromExistingSlug('hello-world');
  expect(isRight(result)).toBe(true);
  if (isRight(result)) {
    expect(result.right.value).toBe('hello-world');
  }
});

test('should return Left when trying to create a slug from an invalid existing slug', () => {
  const result = Slug.createFromExistingSlug('Invalid Slug!');
  expect(isLeft(result)).toBe(true);
});
