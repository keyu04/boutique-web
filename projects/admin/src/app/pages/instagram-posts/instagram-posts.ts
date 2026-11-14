import { DestroyRef, Component, computed, inject, signal } from '@angular/core';
import JSZip from 'jszip';

interface UploadedPhoto {
  id: number;
  file: File;
  previewUrl: string;
}

interface GeneratedPost {
  fileName: string;
  previewUrl: string;
  blob: Blob;
}

const POST_WIDTH = 1200;
const POST_HEIGHT = 1500;
const LOGO_PATH = '/assets/instagram-post-logo.png';
const PRICE_TAG_PATH = '/assets/instagram-price-tag.png';

@Component({
  selector: 'app-instagram-posts',
  templateUrl: './instagram-posts.html',
  styleUrl: './instagram-posts.scss',
})
export class InstagramPostsPage {
  private readonly destroyRef = inject(DestroyRef);
  private nextPhotoId = 0;
  readonly photos = signal<UploadedPhoto[]>([]);
  readonly priceInput = signal('');
  readonly generating = signal(false);
  readonly posts = signal<GeneratedPost[]>([]);
  readonly error = signal<string | null>(null);
  readonly notice = signal<string | null>(null);
  private readonly zipBlob = signal<Blob | null>(null);

  private readonly enteredPrice = computed(() => {
    const price = Number(this.priceInput());
    return Number.isSafeInteger(price) && price > 0 ? price : null;
  });
  readonly formattedPrice = computed(() => {
    const price = this.enteredPrice();
    return price === null ? '' : `₹${new Intl.NumberFormat('en-IN').format(price)}`;
  });
  readonly canGenerate = computed(() =>
    this.photos().length > 0 && this.enteredPrice() !== null && !this.generating(),
  );

  constructor() {
    this.destroyRef.onDestroy(() => {
      for (const photo of this.photos()) URL.revokeObjectURL(photo.previewUrl);
      this.clearGeneratedPosts();
    });
  }

  onFilesSelected(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (files.length === 0) return;

    const accepted = files.filter(file => file.type.startsWith('image/'));
    const rejectedCount = files.length - accepted.length;
    this.error.set(rejectedCount > 0 ? 'Some files were skipped because they are not images.' : null);
    this.notice.set(null);
    if (accepted.length === 0) return;

    const added = accepted.map(file => ({
      id: this.nextPhotoId++,
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    this.photos.update(photos => [...photos, ...added]);
    this.clearGeneratedPosts();
  }

  removePhoto(id: number): void {
    const photo = this.photos().find(item => item.id === id);
    if (!photo) return;
    URL.revokeObjectURL(photo.previewUrl);
    this.photos.update(photos => photos.filter(item => item.id !== id));
    this.clearGeneratedPosts();
    this.error.set(null);
    this.notice.set(null);
  }

  setPrice(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    const value = input.value;
    if (value === this.priceInput()) return;
    this.priceInput.set(value);
    this.clearGeneratedPosts();
    this.error.set(null);
    this.notice.set(null);
  }

  async generatePosts(): Promise<void> {
    const price = this.enteredPrice();
    const photos = this.photos();
    if (price === null || photos.length === 0 || this.generating()) return;

    this.generating.set(true);
    this.error.set(null);
    this.notice.set(null);
    this.clearGeneratedPosts();
    const generated: GeneratedPost[] = [];

    try {
      const [logo, priceTag] = await Promise.all([
        this.loadImage(LOGO_PATH),
        this.loadImage(PRICE_TAG_PATH),
      ]);
      const priceText = `₹${new Intl.NumberFormat('en-IN').format(price)}`;

      for (const [index, photo] of photos.entries()) {
        const source = await this.loadImage(photo.previewUrl);
        const canvas = this.createPostCanvas(source, logo, priceTag, priceText);
        const blob = await this.canvasToBlob(canvas);
        const baseName = this.safeBaseName(photo.file.name);
        const sequence = photos.length > 1 ? `${String(index + 1).padStart(2, '0')}-` : '';
        const fileName = `${sequence}sahjish-${baseName}-instagram.png`;
        generated.push({ fileName, previewUrl: URL.createObjectURL(blob), blob });
      }

      this.posts.set(generated);
      if (generated.length > 1) {
        const zip = new JSZip();
        for (const post of generated) zip.file(post.fileName, post.blob);
        this.zipBlob.set(await zip.generateAsync({ type: 'blob' }));
      }
      this.notice.set(`${generated.length} ${generated.length === 1 ? 'post is' : 'posts are'} ready to download.`);
    } catch (reason) {
      for (const post of generated) URL.revokeObjectURL(post.previewUrl);
      const detail = reason instanceof Error ? reason.message : 'Unexpected image processing error.';
      this.error.set(`Could not create the posts. ${detail}`);
      this.clearGeneratedPosts();
    } finally {
      this.generating.set(false);
    }
  }

  downloadPosts(): void {
    const posts = this.posts();
    if (posts.length === 1) {
      this.download(posts[0].blob, posts[0].fileName);
      return;
    }
    const zip = this.zipBlob();
    if (posts.length > 1 && zip) this.download(zip, 'sahjish-instagram-posts.zip');
  }

  private createPostCanvas(
    source: HTMLImageElement,
    logo: HTMLImageElement,
    priceTag: HTMLImageElement,
    priceText: string,
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = POST_WIDTH;
    canvas.height = POST_HEIGHT;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Your browser could not prepare the image canvas.');

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    const scale = Math.max(POST_WIDTH / source.naturalWidth, POST_HEIGHT / source.naturalHeight);
    const cropWidth = POST_WIDTH / scale;
    const cropHeight = POST_HEIGHT / scale;
    context.drawImage(
      source,
      (source.naturalWidth - cropWidth) / 2,
      (source.naturalHeight - cropHeight) / 2,
      cropWidth,
      cropHeight,
      0,
      0,
      POST_WIDTH,
      POST_HEIGHT,
    );

    const logoFade = context.createLinearGradient(0, 0, 190, 160);
    logoFade.addColorStop(0, 'rgb(255 248 237 / 96%)');
    logoFade.addColorStop(0.58, 'rgb(255 248 237 / 76%)');
    logoFade.addColorStop(1, 'rgb(255 248 237 / 0%)');
    context.fillStyle = logoFade;
    context.fillRect(0, 0, 190, 160);

    this.drawFrame(context);
    this.drawSprig(context, POST_WIDTH - 10, 8, -1, 1);
    this.drawSprig(context, 10, POST_HEIGHT - 8, 1, -1);

    const logoWidth = 132;
    context.drawImage(logo, 27, 21, logoWidth, logoWidth * logo.naturalHeight / logo.naturalWidth);

    const badgeWidth = 250;
    const badgeHeight = badgeWidth * priceTag.naturalHeight / priceTag.naturalWidth;
    const badgeX = POST_WIDTH - badgeWidth - 19;
    const badgeY = POST_HEIGHT - badgeHeight - 21;
    context.drawImage(priceTag, badgeX, badgeY, badgeWidth, badgeHeight);

    const textX = badgeX + badgeWidth * 0.18;
    const textY = badgeY + badgeHeight * 0.39;
    const textWidth = badgeWidth * 0.64;
    const textHeight = badgeHeight * 0.31;
    const priceFill = context.createLinearGradient(0, textY, 0, textY + textHeight);
    priceFill.addColorStop(0, '#791c2c');
    priceFill.addColorStop(1, '#6d1b2c');
    context.fillStyle = priceFill;
    context.beginPath();
    context.roundRect(textX, textY, textWidth, textHeight, 8);
    context.fill();
    context.fillStyle = '#f9e8d4';
    context.font = 'bold 36px Georgia, serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(priceText, textX + textWidth / 2, textY + textHeight / 2, textWidth - 8);

    return canvas;
  }

  private drawFrame(context: CanvasRenderingContext2D): void {
    context.save();
    context.beginPath();
    context.roundRect(15, 15, POST_WIDTH - 30, POST_HEIGHT - 30, 30);
    context.strokeStyle = '#f8ead5';
    context.lineWidth = 2.5;
    context.stroke();
    context.beginPath();
    context.roundRect(20, 20, POST_WIDTH - 40, POST_HEIGHT - 40, 26);
    context.strokeStyle = 'rgb(105 28 45 / 70%)';
    context.lineWidth = 1;
    context.stroke();
    context.restore();
  }

  private drawSprig(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    flipX: number,
    flipY: number,
  ): void {
    context.save();
    context.translate(x, y);
    context.scale(flipX, flipY);
    context.strokeStyle = '#9b4b55';
    context.fillStyle = 'rgb(249 214 183 / 88%)';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, 0);
    context.bezierCurveTo(25, 18, 30, 58, 88, 102);
    context.stroke();

    for (const [leafX, leafY, width, rotation] of [
      [15, 16, 27, -0.75],
      [31, 37, 30, 0.68],
      [43, 58, 30, -0.72],
      [59, 78, 27, 0.67],
      [75, 93, 22, -0.72],
    ]) {
      context.save();
      context.translate(leafX, leafY);
      context.rotate(rotation);
      context.beginPath();
      context.moveTo(0, 0);
      context.bezierCurveTo(width * 0.15, -12, width * 0.65, -16, width, -2);
      context.bezierCurveTo(width * 0.64, 10, width * 0.25, 9, 0, 0);
      context.closePath();
      context.fill();
      context.stroke();
      context.restore();
    }
    context.restore();
  }

  private loadImage(source: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('An image could not be loaded.'));
      image.src = source;
    });
  }

  private canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error('The image could not be exported as PNG.'));
      }, 'image/png');
    });
  }

  private safeBaseName(fileName: string): string {
    return fileName
      .replace(/\.[^.]+$/, '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'product';
  }

  private download(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  private clearGeneratedPosts(): void {
    for (const post of this.posts()) URL.revokeObjectURL(post.previewUrl);
    this.posts.set([]);
    this.zipBlob.set(null);
  }
}
