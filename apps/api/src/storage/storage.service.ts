import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface UploadResult {
  fileUrl: string;
  fileName: string;
  fileType: 'IMAGE' | 'PDF';
  mimeType: string;
  fileSize: number;
  provider: 's3' | 'minio' | 'local';
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir: string;

  // S3 / MinIO Configuration
  private readonly s3Endpoint: string | null;
  private readonly s3Region: string;
  private readonly s3Bucket: string | null;
  private readonly s3AccessKeyId: string | null;
  private readonly s3SecretAccessKey: string | null;
  private readonly s3PublicUrl: string | null;
  private readonly s3ForcePathStyle: boolean;
  private readonly isS3Configured: boolean;

  constructor() {
    // Local directory for storage fallback
    this.uploadDir = path.resolve(process.cwd(), 'uploads', 'attachments');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    // Load S3 / MinIO env variables
    this.s3Endpoint = process.env.S3_ENDPOINT || null; // e.g. http://minio:9000 or https://<id>.r2.cloudflarestorage.com
    this.s3Region = process.env.S3_REGION || 'us-east-1';
    this.s3Bucket = process.env.S3_BUCKET || process.env.MINIO_BUCKET || null;
    this.s3AccessKeyId = process.env.S3_ACCESS_KEY_ID || process.env.MINIO_ROOT_USER || null;
    this.s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY || process.env.MINIO_ROOT_PASSWORD || null;
    this.s3PublicUrl = process.env.S3_PUBLIC_URL || null;
    this.s3ForcePathStyle = process.env.S3_FORCE_PATH_STYLE === 'true' || Boolean(this.s3Endpoint);

    this.isS3Configured = Boolean(
      this.s3Bucket && this.s3AccessKeyId && this.s3SecretAccessKey,
    );

    if (this.isS3Configured) {
      this.logger.log(`S3-compatible storage active (Endpoint: ${this.s3Endpoint || 'AWS Standard'}, Bucket: ${this.s3Bucket})`);
    } else {
      this.logger.log(`Local disk storage active at ${this.uploadDir}`);
    }
  }

  getStorageStatus() {
    return {
      provider: this.isS3Configured ? (this.s3Endpoint?.includes('minio') ? 'minio' : 's3') : 'local',
      bucket: this.s3Bucket,
      endpoint: this.s3Endpoint,
      localDir: this.uploadDir,
      isS3Configured: this.isS3Configured,
    };
  }

  /**
   * Upload file from Buffer (multipart or decoded base64)
   */
  async uploadFile(
    buffer: Buffer,
    originalFilename: string,
    mimeType: string,
    subfolder = 'attachments',
  ): Promise<UploadResult> {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (buffer.length > MAX_SIZE) {
      throw new BadRequestException('Ukuran file maksimal adalah 10MB');
    }

    const cleanName = path.basename(originalFilename).replace(/\s+/g, '_');
    const ext = path.extname(cleanName).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

    if (!allowedExtensions.includes(ext)) {
      throw new BadRequestException(
        `Format file tidak didukung (${ext}). Lampiran harus berupa Gambar (JPG, PNG, WEBP) atau Dokumen PDF.`,
      );
    }

    const fileType: 'IMAGE' | 'PDF' = ext === '.pdf' ? 'PDF' : 'IMAGE';
    const uniqueId = crypto.randomUUID();
    const storedFileName = `${Date.now()}-${uniqueId}${ext}`;
    const objectKey = `${subfolder}/${storedFileName}`;

    // 1. Try S3 / MinIO upload if configured
    if (this.isS3Configured) {
      try {
        const s3Url = await this.uploadToS3(buffer, objectKey, mimeType);
        return {
          fileUrl: s3Url,
          fileName: cleanName,
          fileType,
          mimeType,
          fileSize: buffer.length,
          provider: this.s3Endpoint?.includes('minio') ? 'minio' : 's3',
        };
      } catch (err: any) {
        this.logger.warn(`S3/MinIO upload failed (${err.message}). Falling back to local disk storage.`);
      }
    }

    // 2. Fallback to Local Disk Storage
    const filePath = path.join(this.uploadDir, storedFileName);
    await fs.promises.writeFile(filePath, buffer);

    const fileUrl = `/api/v1/storage/files/${storedFileName}`;

    return {
      fileUrl,
      fileName: cleanName,
      fileType,
      mimeType,
      fileSize: buffer.length,
      provider: 'local',
    };
  }

  /**
   * Upload from Base64 Data URI
   */
  async uploadBase64(
    base64Data: string,
    originalFilename: string,
    mimeType?: string,
  ): Promise<UploadResult> {
    let cleanBase64 = base64Data;
    let detectedMime = mimeType || 'image/jpeg';

    if (base64Data.startsWith('data:')) {
      const match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        detectedMime = match[1];
        cleanBase64 = match[2];
      }
    }

    const buffer = Buffer.from(cleanBase64, 'base64');
    return this.uploadFile(buffer, originalFilename, detectedMime);
  }

  /**
   * Retrieve file from local disk storage
   */
  async getLocalFile(filename: string): Promise<{ buffer: Buffer; mimeType: string }> {
    const safeFilename = path.basename(filename);
    const filePath = path.join(this.uploadDir, safeFilename);

    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('File lampiran tidak ditemukan di penyimpanan server.');
    }

    const buffer = await fs.promises.readFile(filePath);
    const ext = path.extname(safeFilename).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
    };

    return {
      buffer,
      mimeType: mimeMap[ext] || 'application/octet-stream',
    };
  }

  /**
   * Pure Node.js AWS Signature V4 S3 / MinIO PutObject Implementation
   */
  private async uploadToS3(
    buffer: Buffer,
    objectKey: string,
    contentType: string,
  ): Promise<string> {
    const bucket = this.s3Bucket!;
    const accessKey = this.s3AccessKeyId!;
    const secretKey = this.s3SecretAccessKey!;
    const region = this.s3Region;
    const endpoint = this.s3Endpoint || `https://${bucket}.s3.${region}.amazonaws.com`;

    const urlObj = new URL(endpoint);
    let host = urlObj.host;
    let requestPath = `/${objectKey}`;

    if (this.s3ForcePathStyle) {
      requestPath = `/${bucket}/${objectKey}`;
    } else if (!this.s3Endpoint) {
      host = `${bucket}.s3.${region}.amazonaws.com`;
    }

    const targetUrl = `${urlObj.protocol}//${host}${requestPath}`;
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substring(0, 8);
    const payloadHash = crypto.createHash('sha256').update(buffer).digest('hex');

    const canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
    const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';

    const canonicalRequest = [
      'PUT',
      encodeURI(requestPath),
      '',
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n');

    const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
    ].join('\n');

    const signingKey = this.getSignatureKey(secretKey, dateStamp, region, 's3');
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

    const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const res = await fetch(targetUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'Host': host,
        'x-amz-date': amzDate,
        'x-amz-content-sha256': payloadHash,
        'Authorization': authorizationHeader,
      },
      body: buffer as any,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`S3 PutObject HTTP ${res.status}: ${errText}`);
    }

    if (this.s3PublicUrl) {
      return `${this.s3PublicUrl.replace(/\/$/, '')}/${objectKey}`;
    }

    return targetUrl;
  }

  private getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string) {
    const kDate = crypto.createHmac('sha256', 'AWS4' + key).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest();
    return crypto.createHmac('sha256', kService).update('aws4_request').digest();
  }
}
