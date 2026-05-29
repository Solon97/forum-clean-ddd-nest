import { UseCaseError } from '@/shared/errors/use-case-error';

export class InvalidTokenError extends Error implements UseCaseError {
  constructor() {
    super('Invalid token');
    this.name = 'InvalidTokenError';
  }
}
