import { UploadFileParams, UploadFileResult } from '../gateways/storage';
import { UploadAttachmentUseCase } from './upload-attachment';
import { InMemoryAttachmentRepository } from '@test/repositories/in-memory-attachment-repository';
import {
  assertEitherIsLeft,
  assertEitherIsRight,
} from '@test/helpers/assert-either';

class FakeStorageGateway {
  public uploadResult: UploadFileResult = {
    url: 'http://bucket.local/file.png',
  };

  upload(file: UploadFileParams): Promise<UploadFileResult> {
    void file;
    return Promise.resolve(this.uploadResult);
  }
}

describe('Upload Attachment', () => {
  it('should upload and persist an attachment', async () => {
    const attachmentRepository = new InMemoryAttachmentRepository();
    const storageGateway = new FakeStorageGateway();
    const sut = new UploadAttachmentUseCase(
      attachmentRepository,
      storageGateway,
    );

    const result = await sut.execute({
      fileName: 'avatar.png',
      fileType: 'image/png',
      body: Buffer.from('file-content'),
      size: 1024,
    });

    assertEitherIsRight(result);
    expect(attachmentRepository.items).toHaveLength(1);
    expect(result.right.attachment.title).toBe('avatar.png');
    expect(result.right.attachment.url).toBe('http://bucket.local/file.png');
  });

  it('should fail when file type is invalid', async () => {
    const attachmentRepository = new InMemoryAttachmentRepository();
    const storageGateway = new FakeStorageGateway();
    const sut = new UploadAttachmentUseCase(
      attachmentRepository,
      storageGateway,
    );

    const result = await sut.execute({
      fileName: 'notes.txt',
      fileType: 'text/plain',
      body: Buffer.from('file-content'),
      size: 1024,
    });

    assertEitherIsLeft(result);
    expect(result.left.name).toBe('InvalidAttachmentTypeError');
    expect(attachmentRepository.items).toHaveLength(0);
  });

  it('should fail when file exceeds 5MB', async () => {
    const attachmentRepository = new InMemoryAttachmentRepository();
    const storageGateway = new FakeStorageGateway();
    const sut = new UploadAttachmentUseCase(
      attachmentRepository,
      storageGateway,
    );

    const result = await sut.execute({
      fileName: 'big.pdf',
      fileType: 'application/pdf',
      body: Buffer.from('file-content'),
      size: 6 * 1024 * 1024,
    });

    assertEitherIsLeft(result);
    expect(result.left.name).toBe('AttachmentTooLargeError');
    expect(attachmentRepository.items).toHaveLength(0);
  });
});
