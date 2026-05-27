export class UniqueEntityId {
  readonly value: string;

  constructor(value?: string) {
    if (value) {
      this.validate(value);
    }
    this.value = value ?? crypto.randomUUID();
  }

  private validate(value: string) {
    const regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!regex.test(value)) {
      throw new Error('Invalid Unique Entity ID');
    }
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
