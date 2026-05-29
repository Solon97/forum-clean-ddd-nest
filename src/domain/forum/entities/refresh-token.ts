import { BaseEntity } from '@/shared/entities/base-entity';
import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';

export interface RefreshTokenProps {
  token: string;
  userId: UniqueEntityId;
  expiresAt: Date;
  revoked: boolean;
}

export class RefreshToken extends BaseEntity<RefreshTokenProps> {
  get token() {
    return this.props.token;
  }

  get userId() {
    return this.props.userId;
  }

  get expiresAt() {
    return this.props.expiresAt;
  }

  get revoked() {
    return this.props.revoked;
  }

  isExpired(now: Date = new Date()): boolean {
    return this.expiresAt < now;
  }

  revoke(): void {
    this.props.revoked = true;
  }
}
