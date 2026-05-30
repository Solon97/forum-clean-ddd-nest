export interface UploadedAttachmentFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}
