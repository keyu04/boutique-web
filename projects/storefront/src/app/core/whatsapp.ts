export function getWhatsAppShareUrl(value: string | undefined): string | null {
  if (!value) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.protocol !== 'https:' || url.host !== 'wa.me' || url.username || url.password)
    return null;

  const number = url.pathname.replace(/^\/\+?/, '');
  if (!/^\d{8,15}$/.test(number)) return null;

  url.pathname = `/${number}`;
  return url.toString();
}
