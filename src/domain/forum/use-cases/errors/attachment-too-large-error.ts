import { UseCaseError } from '@/shared/errors/use-case-error';

export class AttachmentTooLargeError extends Error implements UseCaseError {
  constructor() {
    super('Attachment size exceeds 5MB');
    this.name = 'AttachmentTooLargeError';
  }
}
