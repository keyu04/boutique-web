import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Title } from '@angular/platform-browser';
import { CategoriesApi, ProductsApi } from '@shared';
import { of } from 'rxjs';
import { BagService } from '../../core/bag.service';
import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  const products = [
    { id: 1, name: 'Evening Dress', slug: 'evening-dress', price: 1200, mrp: 1600,
      color: 'Red', fabric: 'Cotton', tag: null, image: '/evening.jpg', sizes: [] },
    { id: 2, name: 'Red Dress', slug: 'red-dress', price: 1400, mrp: 1800,
      color: 'Maroon', fabric: 'Cotton', tag: null, image: '/red.jpg', sizes: [] },
  ];

  beforeEach(async () => {
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
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
});
