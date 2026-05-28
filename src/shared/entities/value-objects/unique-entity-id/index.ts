import { Either, left, right } from 'fp-ts/lib/Either';

export class InvalidUniqueEntityIdError extends Error {
  constructor(entityName?: string) {
    super(`Invalid Unique Entity ID${entityName ? ` for ${entityName}` : ''}`);
    this.name = 'InvalidUniqueEntityIdError';
  }
}

export class UniqueEntityId {
  readonly value: string;

  private constructor(value?: string) {
    this.value = value ?? crypto.randomUUID();
  }

  static create() {
    return new UniqueEntityId();
  }

  static createFromExistingId(
    value: string,
  ): Either<InvalidUniqueEntityIdError, UniqueEntityId> {
    if (!this.validate(value)) {
      return left(new InvalidUniqueEntityIdError());
    }
    return right(new UniqueEntityId(value));
  }

  private static validate(value: string) {
    const regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(value);
  }

  toString() {
    return this.value;
  }

  toValue() {
    return this.value;
  }

  public equals(id: UniqueEntityId) {
    return id.toValue() === this.value;
  }
}
