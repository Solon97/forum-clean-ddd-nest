export interface UploadFileParams {
  fileName: string;
  fileType: string;
  body: Buffer;
}

export interface UploadFileResult {
  url: string;
}

export interface StorageGateway {
  upload(file: UploadFileParams): Promise<UploadFileResult>;
}
