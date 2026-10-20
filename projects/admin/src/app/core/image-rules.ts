export const MAX_IMAGES = 8;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_SOURCE_IMAGE_BYTES = 25 * 1024 * 1024;
export const OUTPUT_IMAGE_WIDTH = 1200;
export const OUTPUT_IMAGE_HEIGHT = 1500;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_PIXELS = 50_000_000;

export function checkImageFiles(files: File[], alreadyHave: number): { ok: File[]; problems: string[] } {
  const ok: File[] = [];
  const problems: string[] = [];
  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      problems.push(`${file.name}: only JPEG, PNG or WebP images are allowed.`);
    } else if (file.size > MAX_SOURCE_IMAGE_BYTES) {
      problems.push(`${file.name}: original image is larger than 25 MB.`);
    } else if (alreadyHave + ok.length >= MAX_IMAGES) {
      problems.push(`${file.name}: a product can have at most ${MAX_IMAGES} photos.`);
    } else {
      ok.push(file);
    }
  }
  return { ok, problems };
}

export async function prepareImageFiles(
  files: File[],
  alreadyHave: number,
): Promise<{ ok: File[]; problems: string[] }> {
  const checked = checkImageFiles(files, alreadyHave);
  const ok: File[] = [];
  const problems = [...checked.problems];

  for (const file of checked.ok) {
    try {
      const optimized = await optimizeImage(file);
      if (optimized.size > MAX_IMAGE_BYTES) {
        problems.push(`${file.name}: optimized image is still larger than 5 MB.`);
      } else {
        ok.push(optimized);
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Image could not be processed.';
      problems.push(`${file.name}: ${reason}`);
    }
  }

  return { ok, problems };
}

async function optimizeImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > MAX_IMAGE_PIXELS) {
      throw new Error('image dimensions are too large to process safely.');
    }

    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_IMAGE_WIDTH;
    canvas.height = OUTPUT_IMAGE_HEIGHT;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('image processing is unavailable in this browser.');

    context.fillStyle = '#f7f2e9';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    const scale = Math.min(canvas.width / bitmap.width, canvas.height / bitmap.height);
    const width = bitmap.width * scale;
    const height = bitmap.height * scale;
    context.drawImage(bitmap, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);

    let blob: Blob | null = null;
    for (const quality of [0.84, 0.72, 0.6, 0.5]) {
      blob = await encodeWebp(canvas, quality);
      if (blob.size <= MAX_IMAGE_BYTES) break;
    }
    if (!blob) throw new Error('image could not be converted to WebP.');

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'product-image';
    return new File([blob], `${baseName}.webp`, { type: 'image/webp', lastModified: Date.now() });
  } finally {
    bitmap.close();
  }
}

function encodeWebp(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('Image conversion is not supported in this browser.'));
      } else if (blob.type !== 'image/webp') {
        reject(new Error('WebP conversion is not supported in this browser.'));
      } else {
        resolve(blob);
      }
    }, 'image/webp', quality);
  });
}