import { Either, isLeft } from 'fp-ts/lib/Either';
/**
 * Unwraps the value from an Either, throwing an error if it is a Left.
 * @param either The Either to unwrap.
 * @returns The value if the Either is a Right.
 * @throws The error if the Either is a Left.
 */
export function unsafeUnwrap<E extends Error, A>(either: Either<E, A>): A {
  if (isLeft(either)) throw either.left;
  return either.right;
}
