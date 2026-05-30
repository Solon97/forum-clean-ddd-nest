import { Either, left, right } from 'fp-ts/lib/Either';
import { Attachment, AttachmentProps } from '../entities/attachment';
import { StorageGateway } from '../gateways/storage';
import { AttachmentRepository } from '../repositories/attachment-repository';
import { AttachmentTooLargeError } from './errors/attachment-too-large-error';
import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type-error';

const ACCEPTED_ATTACHMENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const MAX_ATTACHMENT_SIZE_IN_BYTES = 5 * 1024 * 1024;

export interface UploadAttachmentUseCaseInput {
  fileName: string;
  fileType: string;
  body: Buffer;
  size: number;
}

export interface UploadAttachmentUseCaseOutput {
  attachment: Attachment<AttachmentProps>;
}

export class UploadAttachmentUseCase {
  constructor(
    private readonly attachmentRepository: AttachmentRepository,
    private readonly storageGateway: StorageGateway,
  ) {}

  async execute({
    fileName,
    fileType,
    body,
    size,
  }: UploadAttachmentUseCaseInput): Promise<
    Either<
      InvalidAttachmentTypeError | AttachmentTooLargeError,
      UploadAttachmentUseCaseOutput
    >
  > {
    if (!ACCEPTED_ATTACHMENT_TYPES.has(fileType)) {
      return left(new InvalidAttachmentTypeError());
    }

    if (size > MAX_ATTACHMENT_SIZE_IN_BYTES) {
      return left(new AttachmentTooLargeError());
    }

    const uploaded = await this.storageGateway.upload({
      fileName,
      fileType,
      body,
    });

    const attachment = new Attachment({
      title: fileName,
      url: uploaded.url,
    });

    await this.attachmentRepository.create(attachment);

    return right({ attachment });
  }
}
