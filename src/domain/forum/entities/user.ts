import { BaseEntity } from '@/shared/entities/base-entity';
import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';

export interface UserProps {
  name: string;
  email: string;
  passwordHash: string;
}

export class User extends BaseEntity<UserProps> {
  get name() {
    return this.props.name;
  }

  get email() {
    return this.props.email;
  }

  get passwordHash() {
    return this.props.passwordHash;
  }

  static create(props: UserProps, id?: UniqueEntityId): User {
    return new User(props, id);
  }
}
