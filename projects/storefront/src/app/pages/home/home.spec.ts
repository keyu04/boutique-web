import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Title } from '@angular/platform-browser';
import { CategoriesApi, ProductsApi } from '@shared';
import { NEVER, of } from 'rxjs';
import { BagService } from '../../core/bag.service';
import { FavoritesService } from '../../core/favorites.service';
import { ProductListReturnState } from '../../core/product-list-return-state';
import { Home } from './home';

describe('Home', () => {
  const favoritesStorageKey = 'sahjish.favorites.v1';
  let component: Home;
  let fixture: ComponentFixture<Home>;
  const products = [
    { id: 1, name: 'Evening Dress', slug: 'evening-dress', price: 1200, mrp: 1600,
      color: 'Red', fabric: 'Cotton', tag: null, image: '/evening.jpg', sizes: [] },
    { id: 2, name: 'Red Dress', slug: 'red-dress', price: 1400, mrp: 1800,
      color: 'Maroon', fabric: 'Cotton', tag: null, image: '/red.jpg', sizes: [] },
  ];

  beforeEach(async () => {
    localStorage.removeItem(favoritesStorageKey);
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([{ path: '', component: Home }]),
        { provide: ProductsApi, useValue: { list: () => of({ total: products.length, page: 1, pageSize: 12, items: products }) } },
        { provide: CategoriesApi, useValue: { list: () => of([{ id: 1, name: 'Dresses', slug: 'dresses' }]) } },
        { provide: BagService, useValue: { count: () => 0, add: () => null } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.removeItem(favoritesStorageKey);
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('persists favorites so they are restored by a new service instance', () => {
    component.toggleFavorite(1);

    expect(localStorage.getItem(favoritesStorageKey)).toBe('[1]');
    expect(new FavoritesService().isFavorite(1)).toBe(true);

    component.toggleFavorite(1);
    expect(new FavoritesService().isFavorite(1)).toBe(false);
  });

  it('restores the storefront title after returning from another page', () => {
    const title = TestBed.inject(Title);
    title.setTitle('Sahjish Fashion | Your bag');
    fixture.destroy();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;

    expect(title.getTitle()).toBe('Sahjish Fashion | Wear your everyday beautifully.');
  });

  it('scrolls to the collection for a category URL without a fragment', async () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    const harness = await RouterTestingHarness.create();
    const routedHome = await harness.navigateByUrl('/?category=dresses', Home);
    expect(routedHome.selectedCategory()).toBe('dresses');

    const collection = harness.routeNativeElement?.querySelector('#collection') as HTMLElement;
    vi.spyOn(collection, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 500, top: 500, bottom: 1200, left: 0, right: 300, width: 300, height: 700,
      toJSON: () => ({}),
    } as DOMRect);
    let frameCount = 0;
    while (frames.length && frameCount < 10) {
      frames.shift()?.(0);
      frameCount++;
    }

    expect(scrollTo).toHaveBeenCalledWith({ top: 500, behavior: 'auto' });
  });

  it('adds the collection fragment when switching categories from a query-only URL', async () => {
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    const harness = await RouterTestingHarness.create();
    const routedHome = await harness.navigateByUrl('/?category=dresses', Home);

    routedHome.selectCategory({ id: 2, name: 'Kurta Sets', slug: 'kurta-sets' });
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/?category=kurta-sets#collection');
  });

  it('targets the product list when switching categories from the floating menu', async () => {
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    const harness = await RouterTestingHarness.create();
    const routedHome = await harness.navigateByUrl('/?category=dresses#collection', Home);

    routedHome.categoriesFloating.set(true);
    routedHome.selectCategory({ id: 2, name: 'Kurta Sets', slug: 'kurta-sets' });
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/?category=kurta-sets#collection-products');
  });

  it('restores the product opened from the collection after returning', () => {
    component.rememberProductForReturn('red-dress', new MouseEvent('click'));
    fixture.destroy();

    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const product = fixture.nativeElement.querySelector('[data-product-slug="red-dress"]') as HTMLElement;
    vi.spyOn(product, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 500, top: 500, bottom: 1200, left: 0, right: 300, width: 300, height: 700,
      toJSON: () => ({}),
    } as DOMRect);

    let frameCount = 0;
    while (frames.length && frameCount < 10) {
      frames.shift()?.(0);
      frameCount++;
    }

    expect(scrollTo).toHaveBeenCalledWith({ top: 484, behavior: 'auto' });
  });

  it('restores the homepage scroll position after a Back navigation', () => {
    fixture.destroy();
    TestBed.inject(ProductListReturnState).rememberScrollPosition(1800);

    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();

    let frameCount = 0;
    while (frames.length && frameCount < 10) {
      frames.shift()?.(0);
      frameCount++;
    }

    expect(scrollTo).toHaveBeenCalledWith({ top: 1800, behavior: 'auto' });
  });

  it('keeps the Home layout stable while products are loading', () => {
    fixture.destroy();
    vi.spyOn(TestBed.inject(ProductsApi), 'list').mockReturnValue(NEVER);

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.hero-art-placeholder')).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('.skeleton-card')).toHaveLength(12);
  });

  it('does not add a second scroll after a floating category is selected', async () => {
    fixture.detectChanges();

    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    component.categoriesFloating.set(true);
    component.selectCategory({ id: 2, name: 'Co-ords', slug: 'co-ords' });

    await fixture.whenStable();
    let frameCount = 0;
    while (frames.length && frameCount < 10) {
      frames.shift()?.(0);
      frameCount++;
    }
    expect(scrollTo).not.toHaveBeenCalled();
    expect(TestBed.inject(Router).url).toBe('/?category=co-ords#collection-products');
  });

  it('keeps products below the full header when selecting a floating category', () => {
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('app-site-header') as HTMLElement;
    const filters = fixture.nativeElement.querySelector('.category-filters') as HTMLElement;
    const anchor = fixture.nativeElement.querySelector('#collection-products') as HTMLElement;
    Object.defineProperty(header, 'offsetHeight', { configurable: true, value: 136 });
    vi.spyOn(filters, 'getBoundingClientRect').mockReturnValue({ bottom: 96 } as DOMRect);
    component.categoriesFloating.set(true);

    component.selectCategory({ id: 2, name: 'Co-ords', slug: 'co-ords' });

    expect(anchor.style.height).toBe('148px');
  });

  it('keeps existing cards fully visible while a category refresh is pending', () => {
    vi.spyOn(TestBed.inject(ProductsApi), 'list').mockReturnValue(NEVER);

    component.selectCategory({ id: 2, name: 'Co-ords', slug: 'co-ords' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.item')).toHaveLength(products.length);
    expect(fixture.nativeElement.querySelector('.grid')?.classList.contains('updating')).toBe(false);
    expect(fixture.nativeElement.querySelector('.updating-status')?.textContent).toContain('Updating collection');
    expect(fixture.nativeElement.querySelector('.updating-status')?.hidden).toBe(false);
  });

  it('uses the prefetched category products without another API request', () => {
    const list = vi.spyOn(TestBed.inject(ProductsApi), 'list');

    component.selectCategory({ id: 1, name: 'Dresses', slug: 'dresses' });
    fixture.detectChanges();

    expect(list).not.toHaveBeenCalled();
    expect(component.loading()).toBe(false);
    expect(component.products()).toEqual(products);
  });
});
