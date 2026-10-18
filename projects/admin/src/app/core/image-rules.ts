export const MAX_IMAGES = 8;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function checkImageFiles(files: File[], alreadyHave: number): { ok: File[]; problems: string[] } {
  const ok: File[] = [];
  const problems: string[] = [];
  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      problems.push(`${file.name}: only JPEG, PNG or WebP images are allowed.`);
    } else if (file.size > MAX_IMAGE_BYTES) {
      problems.push(`${file.name}: larger than 5 MB.`);
    } else if (alreadyHave + ok.length >= MAX_IMAGES) {
      problems.push(`${file.name}: a product can have at most ${MAX_IMAGES} photos.`);
    } else {
      ok.push(file);
    }
  }
  return { ok, problems };
}   