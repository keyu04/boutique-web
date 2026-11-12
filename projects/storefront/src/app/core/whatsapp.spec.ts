import { describe, expect, it } from 'vitest';
import { getWhatsAppShareUrl } from './whatsapp';

describe('getWhatsAppShareUrl', () => {
  it('removes the leading plus from the wa.me phone path', () => {
    expect(getWhatsAppShareUrl('https://wa.me/+919016190991?text=New%20order')).toBe(
      'https://wa.me/919016190991?text=New%20order',
    );
  });

  it('rejects URLs that do not point to wa.me over HTTPS', () => {
    expect(getWhatsAppShareUrl('https://example.com/919016190991?text=New%20order')).toBeNull();
    expect(getWhatsAppShareUrl('http://wa.me/919016190991?text=New%20order')).toBeNull();
  });

  it('rejects invalid phone paths', () => {
    expect(getWhatsAppShareUrl('https://wa.me/not-a-number?text=New%20order')).toBeNull();
    expect(getWhatsAppShareUrl(undefined)).toBeNull();
  });
});
