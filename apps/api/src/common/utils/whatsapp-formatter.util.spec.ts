import { describe, it, expect } from 'vitest';
import { normalizeWhatsAppNumber } from './whatsapp-formatter.util';

describe('normalizeWhatsAppNumber Utility', () => {
  it('should normalize 08123456789 to 628123456789', () => {
    expect(normalizeWhatsAppNumber('08123456789')).toBe('628123456789');
  });

  it('should normalize +62 812-3456-789 to 628123456789', () => {
    expect(normalizeWhatsAppNumber('+62 812-3456-789')).toBe('628123456789');
  });

  it('should keep 628123456789 unchanged', () => {
    expect(normalizeWhatsAppNumber('628123456789')).toBe('628123456789');
  });
});
