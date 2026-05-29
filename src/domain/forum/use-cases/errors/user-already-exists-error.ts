import { UseCaseError } from '@/shared/errors/use-case-error';

export class UserAlreadyExistsError extends Error implements UseCaseError {
  constructor() {
    super('User with same email already exists');
  }
}
