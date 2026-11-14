import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProductsApi, ProductSummary } from '@shared';
import { of } from 'rxjs';
import { FavoritesService } from '../../core/favorites.service';
import { WishlistPage } from './wishlist';

describe('WishlistPage', () => {
  let component: WishlistPage;
  let fixture: ComponentFixture<WishlistPage>;
  const products: ProductSummary[] = [
    { id: 1, name: 'Evening Dress', slug: 'evening-dress', price: 1200, mrp: 1600,
      color: 'Red', fabric: 'Cotton', tag: null, image: '/evening.jpg', sizes: [] },
    { id: 2, name: 'Red Dress', slug: 'red-dress', price: 1400, mrp: 1800,
      color: 'Maroon', fabric: 'Cotton', tag: null, image: '/red.jpg', sizes: [] },
  ];

  beforeEach(async () => {
    localStorage.setItem('sahjish.favorites.v1', '[1,2]');
    await TestBed.configureTestingModule({
      imports: [WishlistPage],
      providers: [
        provideRouter([]),
        {
          provide: ProductsApi,
          useValue: {
            list: ({ page = 1 }: { page?: number }) => of({
              total: products.length,
              page,
              pageSize: 1,
              items: [products[page - 1]],
            }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WishlistPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('sahjish.favorites.v1');
  });

  it('loads favorited products across catalog pages', () => {
    expect(component.products().map(product => product.id)).toEqual([1, 2]);
    expect(fixture.nativeElement.textContent).toContain('Evening Dress');
    expect(fixture.nativeElement.textContent).toContain('Red Dress');
  });

  it('removes a product from the wishlist and persistent favorites', () => {
    const removeButton = fixture.nativeElement.querySelector(
      'button[aria-label="Remove Evening Dress from wishlist"]',
    ) as HTMLButtonElement;
    removeButton.click();
    fixture.detectChanges();

    expect(component.products().map(product => product.id)).toEqual([2]);
    expect(localStorage.getItem('sahjish.favorites.v1')).toBe('[2]');
  });
});
