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
  const slug = Slug.createFromExistingSlug('hello-world');
  expect(slug.value).toBe('hello-world');
});

test('should throw an error when trying to create a slug from an invalid existing slug', () => {
  expect(() => {
    Slug.createFromExistingSlug('Invalid Slug!');
  }).toThrow('Invalid slug');
});
