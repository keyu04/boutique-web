import { CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, ElementRef, HostListener, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { CategoriesApi, Category, ProductsApi, ProductDetail, ProductImage, ProductSize, ProductSummary, BRAND } from '@shared';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EMPTY, Subject, catchError, switchMap, tap } from 'rxjs';
import { BagService } from '../../core/bag.service';
import { FavoritesService } from '../../core/favorites.service';
import { formatPageTitle } from '../../core/page-title';
import { ProductListReturnState } from '../../core/product-list-return-state';
import { SiteHeader } from '../../core/site-header';
import { SiteFooter } from '../../core/site-footer';

@Component({
  selector: 'app-home',
  imports: [CurrencyPipe, RouterLink, SiteHeader, SiteFooter],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly destroyRef = inject(DestroyRef);
  private readonly api = inject(ProductsApi);
  private readonly categoriesApi = inject(CategoriesApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly productListReturnState = inject(ProductListReturnState);
  private readonly categorySelection = new Subject<string | null>();
  private headerRevealTimer: ReturnType<typeof setTimeout> | null = null;
  private routeCategoryInitialized = false;
  private scrollToInitialCategory = false;

  @ViewChild('collectionSection') private collectionSection?: ElementRef<HTMLElement>;
  @ViewChild('categoryFilters') private categoryFilters?: ElementRef<HTMLElement>;
  @ViewChild('productGrid') private productGrid?: ElementRef<HTMLElement>;
  @ViewChild(SiteHeader, { read: ElementRef }) private siteHeader?: ElementRef<HTMLElement>;

  readonly brand = BRAND;
  readonly bag = inject(BagService);
  readonly favorites = inject(FavoritesService);
  readonly categories = signal<Category[]>([]);
  readonly products = signal<ProductSummary[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly featured = signal<ProductSummary | null>(null);
  readonly selectedCategory = signal<string | null>(null);
  readonly galleries = signal<Record<number, ProductImage[]>>({});
  readonly imageIndexes = signal<Record<number, number>>({});
  readonly loadingGalleries = signal<Record<number, boolean>>({});
  readonly galleryErrors = signal<Record<number, string>>({});
  readonly quickAddId = signal<number | null>(null);
  readonly quickAddIntent = signal<'add' | 'buy'>('add');
  readonly quickAddMessageProductId = signal<number | null>(null);
  readonly quickAddMessage = signal<string | null>(null);
  readonly quickAddSuccess = signal(false);
  readonly categoriesFloating = signal(false);
  readonly categoriesHeaderHidden = signal(false);
  readonly categoriesHeaderRevealing = signal(false);

  constructor() {
    inject(Title).setTitle(formatPageTitle(BRAND.tagline));

    this.destroyRef.onDestroy(() => {
      if (this.headerRevealTimer !== null) clearTimeout(this.headerRevealTimer);
    });

    this.categorySelection.pipe(
    tap(() => {
      this.loading.set(true);
      this.error.set(null);
    }),
    switchMap(category => this.api.list({
      category: category ?? undefined,
      pageSize: 12,
      sort: 'newest',
    }).pipe(
      catchError(() => {
        this.error.set('Could not load products. Is the API running?');
        this.loading.set(false);
        if (this.scrollToInitialCategory) {
          this.scrollToInitialCategory = false;
          this.scrollCollectionIntoView();
        }
        return EMPTY;
      }),
    )),
    takeUntilDestroyed(),
    ).subscribe(page => {
    this.products.set(page.items);
    if (!this.featured()) {
      this.featured.set(page.items.find(p => p.image) ?? null);
    }
    this.loading.set(false);
    if (this.scrollToInitialCategory) {
      this.scrollToInitialCategory = false;
      this.scrollCollectionIntoView();
    }
    const returnProductSlug = this.productListReturnState.consume();
    if (returnProductSlug && page.items.some(product => product.slug === returnProductSlug)) {
      this.restoreProductPosition(returnProductSlug);
    }
    });

    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(params => {
      const category = params.get('category');
      if (this.routeCategoryInitialized && this.selectedCategory() === category) return;
      this.scrollToInitialCategory =
        !this.routeCategoryInitialized && category !== null && !this.route.snapshot.fragment;
      this.routeCategoryInitialized = true;
      this.selectedCategory.set(category);
      this.categorySelection.next(category);
    });

    this.categoriesApi.list().pipe(takeUntilDestroyed()).subscribe({
    next: categories => {
      const order = ['Dresses', 'Kurta Sets', 'Kurtis', 'Co-ords', 'Tops'];
      const orderedCategories = [...categories].sort(
        (a, b) => order.indexOf(a.name) - order.indexOf(b.name),
      );
      this.categories.set(orderedCategories);
    },
    error: () => {
      this.error.set('Could not load collection categories.');
      this.loading.set(false);
    },
    });
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  @HostListener('window:site-header-visibility-change')
  updateFloatingCategories(): void {
    const section = this.collectionSection?.nativeElement;
    const filters = this.categoryFilters?.nativeElement;
    const slot = filters?.parentElement;
    const header = this.siteHeader?.nativeElement;
    if (!section || !filters || !slot || !header) return;

    const headerHeight = header.offsetHeight;
    const headerHidden = header.classList.contains('hidden');
    const categoryTop = headerHidden ? 0 : headerHeight / 2;
    const wasHeaderHidden = this.categoriesHeaderHidden();
    const shouldFloat =
      !headerHidden &&
      slot.getBoundingClientRect().top <= headerHeight + 1 &&
      section.getBoundingClientRect().bottom > categoryTop + filters.offsetHeight / 2;

    if (headerHidden) {
      if (this.headerRevealTimer !== null) {
        clearTimeout(this.headerRevealTimer);
        this.headerRevealTimer = null;
      }
      this.categoriesHeaderRevealing.set(false);
    } else if (wasHeaderHidden) {
      if (this.headerRevealTimer !== null) clearTimeout(this.headerRevealTimer);
      this.categoriesHeaderRevealing.set(true);
      const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 240;
      this.headerRevealTimer = setTimeout(() => {
        this.categoriesHeaderRevealing.set(false);
        this.headerRevealTimer = null;
      }, delay);
    }

    filters.style.setProperty('--category-top', `${categoryTop}px`);
    slot.style.setProperty('--category-height', `${filters.offsetHeight}px`);
    this.categoriesHeaderHidden.set(headerHidden);
    this.categoriesFloating.set(shouldFloat);
  }

  selectCategory(category: Category): void {
    const selectedFromHeader = this.categoriesFloating();
    this.selectedCategory.set(category.slug);
    this.categorySelection.next(category.slug);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: category.slug },
      queryParamsHandling: 'merge',
      fragment: 'collection',
    });
    if (selectedFromHeader) this.scrollProductsBelowHeader();
  }

  selectAllCategories(): void {
    const selectedFromHeader = this.categoriesFloating();
    this.selectedCategory.set(null);
    this.categorySelection.next(null);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: null },
      queryParamsHandling: 'merge',
      fragment: 'collection',
    });
    if (selectedFromHeader) this.scrollProductsBelowHeader();
  }

  private scrollProductsBelowHeader(): void {
    const grid = this.productGrid?.nativeElement;
    const header = this.siteHeader?.nativeElement;
    if (!grid || !header) return;

    const top = grid.getBoundingClientRect().top + window.scrollY - header.offsetHeight;
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    window.scrollTo({ top: Math.max(0, top), behavior });
  }

  private scrollCollectionIntoView(): void {
    requestAnimationFrame(() => {
      const section = this.collectionSection?.nativeElement;
      const header = this.siteHeader?.nativeElement;
      if (!section || !header) return;

      const headerHeight = header.classList.contains('hidden') ? 0 : header.offsetHeight;
      const top = section.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
    });
  }

  rememberProductForReturn(slug: string, event: MouseEvent): void {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    this.productListReturnState.remember(slug);
  }

  private restoreProductPosition(slug: string): void {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const grid = this.productGrid?.nativeElement;
      const product = Array.from(grid?.querySelectorAll<HTMLElement>('[data-product-slug]') ?? [])
        .find(card => card.dataset['productSlug'] === slug);
      if (!product) return;

      const header = this.siteHeader?.nativeElement;
      const filters = this.categoryFilters?.nativeElement;
      const headerHeight = header?.classList.contains('hidden') ? 0 : header?.offsetHeight ?? 0;
      const filtersHeight = filters?.offsetHeight ?? 0;
      const top = product.getBoundingClientRect().top + window.scrollY - headerHeight - filtersHeight - 16;
      window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
    }));
  }

  imageFor(product: ProductSummary): string | null {
    const gallery = this.galleries()[product.id];
    const index = this.imageIndexes()[product.id] ?? 0;
    return gallery?.[index]?.url ?? product.image;
  }

  selectImage(productId: number, index: number): void {
    this.imageIndexes.update(indexes => ({ ...indexes, [productId]: index }));
  }

  moveImage(product: ProductSummary, delta: -1 | 1): void {
    const gallery = this.galleries()[product.id];
    if (gallery) {
      this.imageIndexes.update(indexes => ({
        ...indexes,
        [product.id]: (indexes[product.id] + delta + gallery.length) % gallery.length,
      }));
      return;
    }
    if (this.loadingGalleries()[product.id]) return;

    this.loadingGalleries.update(loading => ({ ...loading, [product.id]: true }));
    this.api.getBySlug(product.slug).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: detail => this.setGallery(product, detail, delta),
      error: () => {
        this.loadingGalleries.update(loading => ({ ...loading, [product.id]: false }));
        this.galleryErrors.update(errors => ({
          ...errors,
          [product.id]: 'Could not load more product photos.',
        }));
      },
    });
  }

  private setGallery(product: ProductSummary, detail: ProductDetail, delta: -1 | 1): void {
    const images = detail.images;
    this.galleries.update(galleries => ({ ...galleries, [product.id]: images }));
    const primaryIndex = Math.max(0, images.findIndex(image => image.isPrimary));
    const nextIndex = images.length > 1 ? (primaryIndex + delta + images.length) % images.length : 0;
    this.imageIndexes.update(indexes => ({ ...indexes, [product.id]: nextIndex }));
    this.loadingGalleries.update(loading => ({ ...loading, [product.id]: false }));
    this.galleryErrors.update(errors => {
      const { [product.id]: _removed, ...remaining } = errors;
      return remaining;
    });
  }

  toggleQuickAdd(product: ProductSummary, intent: 'add' | 'buy'): void {
    const shouldClose = this.quickAddId() === product.id && this.quickAddIntent() === intent;
    this.quickAddId.set(shouldClose ? null : product.id);
    this.quickAddIntent.set(intent);
    this.quickAddMessageProductId.set(null);
    this.quickAddMessage.set(null);
    this.quickAddSuccess.set(false);
  }

  closeQuickAdd(): void {
    this.quickAddId.set(null);
  }

  isFavorite(productId: number): boolean {
    return this.favorites.isFavorite(productId);
  }

  toggleFavorite(productId: number): void {
    this.favorites.toggle(productId);
  }

  discountPercent(product: ProductSummary): number {
    return product.mrp > product.price && product.mrp > 0
      ? Math.round((product.mrp - product.price) / product.mrp * 100)
      : 0;
  }

  quickAdd(product: ProductSummary, size: ProductSize): void {
    const buyNow = this.quickAddIntent() === 'buy';
    const image = this.imageFor(product);
    const error = this.bag.add(
      {
        variantId: size.variantId,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image,
        size: size.size,
        price: product.price,
      },
      size.stockQuantity,
    );
    this.quickAddId.set(null);
    this.quickAddMessageProductId.set(product.id);
    this.quickAddMessage.set(error ?? `${size.size} added to your bag.`);
    this.quickAddSuccess.set(error === null);
    if (buyNow && error === null) void this.router.navigate(['/bag']);
  }
}