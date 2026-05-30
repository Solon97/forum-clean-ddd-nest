import { UseCaseError } from '@/shared/errors/use-case-error';

export class InvalidAttachmentTypeError extends Error implements UseCaseError {
  constructor() {
    super('Invalid attachment type');
    this.name = 'InvalidAttachmentTypeError';
  }
}
