import { Either, Left, Right } from 'fp-ts/lib/Either';

export function assertEitherIsRight<T, E>(
  either: Either<E, T>,
): asserts either is Right<T> {
  expect(either._tag).toBe('Right');
}

export function assertEitherIsLeft<T, E>(
  either: Either<E, T>,
): asserts either is Left<E> {
  expect(either._tag).toBe('Left');
}
