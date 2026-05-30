import {
  StorageGateway,
  UploadFileParams,
} from '@/domain/forum/gateways/storage';
import { EnvConfigService } from '@/infra/env/env.service';
import { Injectable } from '@nestjs/common';
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';

@Injectable()
export class S3StorageGateway implements StorageGateway {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly endpoint?: string;
  private readonly region: string;
  private bucketReady = false;

  constructor(private readonly envService: EnvConfigService) {
    this.bucket = this.envService.get('S3_BUCKET');
    this.endpoint = this.envService.get('S3_ENDPOINT');
    this.region = this.envService.get('S3_REGION');

    this.client = new S3Client({
      region: this.region,
      endpoint: this.endpoint || undefined,
      forcePathStyle: !!this.endpoint,
      credentials: {
        accessKeyId: this.envService.get('S3_ACCESS_KEY'),
        secretAccessKey: this.envService.get('S3_SECRET_KEY'),
      },
    });
  }

  async upload({ fileName, fileType, body }: UploadFileParams) {
    await this.ensureBucketExists();

    const key = `${randomUUID()}-${this.sanitizeFileName(fileName)}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: fileType,
      }),
    );

    return {
      url: this.buildObjectUrl(key),
    };
  }

  private async ensureBucketExists() {
    if (this.bucketReady) {
      return;
    }

    try {
      await this.client.send(
        new HeadBucketCommand({
          Bucket: this.bucket,
        }),
      );
    } catch {
      await this.client.send(
        new CreateBucketCommand({
          Bucket: this.bucket,
        }),
      );
    }

    this.bucketReady = true;
  }

  private sanitizeFileName(fileName: string) {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, '-');
  }

  private buildObjectUrl(key: string) {
    if (this.endpoint) {
      const normalizedEndpoint = this.endpoint.replace(/\/$/, '');
      return `${normalizedEndpoint}/${this.bucket}/${key}`;
    }

    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
