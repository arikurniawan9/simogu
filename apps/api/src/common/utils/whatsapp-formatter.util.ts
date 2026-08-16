/**
 * Normalizes Indonesian WhatsApp phone number to standard format (62xxxxxxxxxxx)
 */
export function normalizeWhatsAppNumber(phone: string): string {
  if (!phone) return phone;

  // Remove spaces, hyphens, plus signs, and non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // Convert 08xxxxxxxxxx to 628xxxxxxxxxx
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }

  return cleaned;
}
