import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';

export interface TokenGenerator {
  generateTokens(
    userId: UniqueEntityId,
  ): Promise<{ access_token: string; refresh_token: string }>;
}
