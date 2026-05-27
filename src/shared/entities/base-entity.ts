import { UniqueEntityId } from './value-objects/unique-entity-id';

export type Timestamps = {
  createdAt: Date;
  updatedAt?: Date;
};

export class BaseEntity<TProps extends object> {
  readonly id: UniqueEntityId;
  protected props: TProps;

  constructor(props: TProps, id?: UniqueEntityId) {
    this.id = id ?? new UniqueEntityId();
    this.props = props;
  }

  protected static setPropsTimestamps<TProps extends object>(
    props: TProps & Partial<Timestamps>,
  ): TProps & Timestamps {
    const now = new Date();
    return {
      ...props,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    };
  }

  protected touch() {
    if (!('updatedAt' in this.props)) {
      throw new Error('Props does not have updatedAt property');
    }
    this.props.updatedAt = new Date();
  }

  equals(object: BaseEntity<TProps>): boolean {
    if (this === object) {
      return true;
    }
    return this.id.equals(object.id);
  }
}
