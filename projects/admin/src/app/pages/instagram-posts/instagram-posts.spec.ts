import { ComponentFixture, TestBed } from '@angular/core/testing';
import JSZip from 'jszip';
import { InstagramPostsPage } from './instagram-posts';

describe('InstagramPostsPage', () => {
  let fixture: ComponentFixture<InstagramPostsPage>;
  let component: InstagramPostsPage;
  const generatedBlobs: Blob[] = [];
  const downloadNames: string[] = [];
  const renderedPrices: string[] = [];
  const generatedDimensions: Array<[number, number]> = [];

  beforeEach(async () => {
    generatedBlobs.length = 0;
    downloadNames.length = 0;
    renderedPrices.length = 0;
    generatedDimensions.length = 0;
    await TestBed.configureTestingModule({ imports: [InstagramPostsPage] }).compileComponents();
    fixture = TestBed.createComponent(InstagramPostsPage);
    component = fixture.componentInstance;

    const gradient = { addColorStop: vi.fn() };
    const context = {
      imageSmoothingEnabled: false,
      imageSmoothingQuality: 'low',
      createLinearGradient: vi.fn(() => gradient),
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      beginPath: vi.fn(),
      roundRect: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      moveTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      closePath: vi.fn(),
      rotate: vi.fn(),
      fillText: vi.fn((text: string) => renderedPrices.push(text)),
    } as unknown as CanvasRenderingContext2D;
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (
      this: HTMLCanvasElement,
      callback,
    ) {
      generatedDimensions.push([this.width, this.height]);
      callback(new Blob(['png'], { type: 'image/png' }));
    });

    class FakeImage {
      naturalWidth = 900;
      naturalHeight = 1200;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {
        this.onload?.();
      }
    }

    vi.stubGlobal('Image', FakeImage);
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn((blob: Blob) => {
        generatedBlobs.push(blob);
        return `blob:generated-${generatedBlobs.length}`;
      }),
      revokeObjectURL: vi.fn(),
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      downloadNames.push(this.download);
    });
    vi.spyOn(window, 'setTimeout').mockImplementation(handler => {
      if (typeof handler === 'function') handler();
      return 0;
    });
  });

  afterEach(() => {
    fixture.destroy();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function addPhoto(name: string): void {
    const photo = new File(['photo'], name, { type: 'image/jpeg' });
    component.photos.update(photos => [
      ...photos,
      { id: photos.length + 1, file: photo, previewUrl: `blob:${name}` },
    ]);
  }

  it('creates and downloads one branded PNG', async () => {
    component.priceInput.set('4999');
    addPhoto('red-dress.jpg');

    expect(component.canGenerate()).toBe(true);
    await component.generatePosts();
    component.downloadPosts();

    expect(component.posts()).toHaveLength(1);
    expect(renderedPrices).toEqual(['₹4,999']);
    expect(generatedDimensions).toEqual([[1200, 1500]]);
    expect(downloadNames).toEqual(['sahjish-red-dress-instagram.png']);
  });

  it('packages multiple generated posts into one ZIP download', async () => {
    component.priceInput.set('4999');
    addPhoto('red-dress.jpg');
    addPhoto('blue-kurti.png');

    await component.generatePosts();
    component.downloadPosts();

    expect(component.posts()).toHaveLength(2);
    expect(renderedPrices).toEqual(['₹4,999', '₹4,999']);
    expect(generatedDimensions).toEqual([[1200, 1500], [1200, 1500]]);
    expect(downloadNames).toEqual(['sahjish-instagram-posts.zip']);
    const archiveBlob = generatedBlobs[generatedBlobs.length - 1];
    expect(archiveBlob).toBeInstanceOf(Blob);
    const archive = await JSZip.loadAsync(archiveBlob);
    expect(Object.keys(archive.files)).toEqual([
      '01-sahjish-red-dress-instagram.png',
      '02-sahjish-blue-kurti-instagram.png',
    ]);
  });
});
