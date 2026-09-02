import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from './storage.service';

describe('StorageService Unit Tests', () => {
  let service: StorageService;

  beforeEach(() => {
    service = new StorageService();
  });

  it('should return storage configuration status', () => {
    const status = service.getStorageStatus();
    expect(status).toHaveProperty('provider');
    expect(status).toHaveProperty('localDir');
    expect(typeof status.isS3Configured).toBe('boolean');
  });

  it('should successfully upload an image buffer', async () => {
    const fakeImageBuffer = Buffer.from('fake-image-bytes');
    const result = await service.uploadFile(fakeImageBuffer, 'surat_sakit.jpg', 'image/jpeg');

    expect(result.fileName).toBe('surat_sakit.jpg');
    expect(result.fileType).toBe('IMAGE');
    expect(result.fileUrl).toContain('/api/v1/storage/files/');
  });

  it('should successfully upload a PDF buffer', async () => {
    const fakePdfBuffer = Buffer.from('%PDF-1.4 test document');
    const result = await service.uploadFile(fakePdfBuffer, 'surat_tugas.pdf', 'application/pdf');

    expect(result.fileName).toBe('surat_tugas.pdf');
    expect(result.fileType).toBe('PDF');
    expect(result.fileUrl).toContain('.pdf');
  });

  it('should reject invalid file extensions', async () => {
    const fakeExeBuffer = Buffer.from('binary-content');
    await expect(
      service.uploadFile(fakeExeBuffer, 'virus.exe', 'application/octet-stream'),
    ).rejects.toThrow(/Format file tidak didukung/);
  });

  it('should successfully upload a Base64 data string', async () => {
    const fakeBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    const result = await service.uploadBase64(fakeBase64, 'bukti_sakit.png');

    expect(result.fileName).toBe('bukti_sakit.png');
    expect(result.fileType).toBe('IMAGE');
    expect(result.fileUrl).toContain('.png');
  });
});
