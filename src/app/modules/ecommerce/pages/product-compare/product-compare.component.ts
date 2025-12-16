// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-product-compare',
//   templateUrl: './product-compare.component.html',
//   styleUrl: './product-compare.component.css'
// })
// export class ProductCompareComponent {

// }


import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, switchMap, take, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';

import {
  EcommerceProduct,
  EcommerceProductFilter,
  EcommerceProductResponse
} from '../../../../shared/models/ecommerce/ecommerce.interface';

import { EcommerceService } from '../../../../core/services/ecommerce/ecommerce.service';
import { Store } from '@ngrx/store';
import { SecurityState } from '../../../../../@security/interfaces/SecurityState';
import { User } from '../../../../shared/models/auth/auth.interface';

@Component({
  selector: 'app-product-compare',
  templateUrl: './product-compare.component.html',
  styleUrls: ['./product-compare.component.scss']
})
export class ProductCompareComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private store: Store<SecurityState> = inject(Store);
   currentUserSession$: Observable<User | null>;
    currentUserSession: User | null = null;

  loading = true;
  errorMessage = '';
  companyId: number = 1;
  baseProduct: EcommerceProduct | null = null;
  similarProducts: EcommerceProduct[] = [];

  breadcrumbItems: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ecommerceService: EcommerceService,
    private messageService: MessageService
  ) { this.currentUserSession$ = this.store.select(state => state.userState.user);}

  ngOnInit(): void {
    this.setupBaseBreadcrumb();

    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const productIdParam = params.get('productId') || params.get('id');
        const productId = productIdParam ? Number(productIdParam) : NaN;

        if (!productId || isNaN(productId)) {
          this.loading = false;
          this.errorMessage = 'El producto seleccionado no es válido.';
          return;
        }

        this.loadBaseProductAndSimilar(productId);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ---------------------------------------------------------------------------
  // Carga de datos
  // ---------------------------------------------------------------------------

  private loadBaseProductAndSimilar(productId: number): void {
    this.loading = true;
    this.errorMessage = '';
    this.baseProduct = null;
    this.similarProducts = [];

    this.ecommerceService.getProductDetail(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (detail: any) => {
          // En algunos proyectos, el detalle viene como { productDTO: {...} }
          // En otros, el objeto ya es el producto. Cubrimos ambos casos:
          const product = detail?.productDTO ?? detail;

          if (!product) {
            this.errorMessage = 'No se pudo cargar la información del producto.';
            this.loading = false;
            return;
          }

          this.baseProduct = product as EcommerceProduct;
          this.updateBreadcrumb();
          this.loadSimilarProducts();
        },
        error: (err) => {
          console.error('Error al cargar producto base para comparación:', err);
          this.errorMessage = 'Ocurrió un error al cargar el producto para comparar.';
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar el producto base.',
            life: 5000
          });
        }
      });
  }

  private loadSimilarProducts(): void {
    if (!this.baseProduct) {
      this.loading = false;
      return;
    }

    const categoryId = 1;

    if (!categoryId) {
      // Sin categoría, no se puede comparar
      this.loading = false;
      this.similarProducts = [];
      return;
    }

    const filter: EcommerceProductFilter = {
      pageNumber: 0,
      pageSize: 20,
      categoryIds: [categoryId],
      sortBy: 'price',
      sortDirection: 'asc'
    };
    this.currentUserSession$.pipe(
     take(1),
                              // Usa switchMap para cambiar al Observable de la llamada al servicio
                              switchMap(user => {
                                this.companyId = user!.company.id;
                                return this.ecommerceService.filterProducts(filter, this.companyId);
                              }

    )
  ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: EcommerceProductResponse) => {
          const baseId = this.baseProduct!.productItemId;

          // Excluimos el producto base de la lista
          const all = response.responseProductList || [];
          this.similarProducts = all.filter(p => p.productItemId !== baseId);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al cargar productos similares:', err);
          this.errorMessage = 'Ocurrió un error al cargar los productos similares.';
          this.loading = false;
        }
      });

  }

  // ---------------------------------------------------------------------------
  // Breadcrumb
  // ---------------------------------------------------------------------------

  private setupBaseBreadcrumb(): void {
    this.breadcrumbItems = [
      { label: 'Inicio', routerLink: '/ecommerce/home' },
      { label: 'Productos', routerLink: '/ecommerce/products' },
      { label: 'Comparar productos' }
    ];
  }

  private updateBreadcrumb(): void {
    this.setupBaseBreadcrumb();

    if (this.baseProduct?.productItemSKU) {
      this.breadcrumbItems[this.breadcrumbItems.length - 1] = {
        label: `Comparando: ${this.baseProduct.productItemSKU}`
      };
    }
  }

  // ---------------------------------------------------------------------------
  // Navegación
  // ---------------------------------------------------------------------------

  goToProductDetail(product: EcommerceProduct): void {
    this.router.navigate(['/ecommerce/products', product.productItemId]);
  }

  // ---------------------------------------------------------------------------
  // Helpers de producto (reutilizados de ProductListComponent)
  // ---------------------------------------------------------------------------

  hasDiscount(product: EcommerceProduct): boolean {
    return true;
  }

  getDiscountPercentage(product: EcommerceProduct): number {

    const promotion = 0.2;
    // Mismo criterio que en ProductListComponent: se asume rate en [0,1]
    return Math.round((promotion || 0) * 100);
  }

  getProductPrice(product: EcommerceProduct): number {

    return product.productItemPrice || 0;
  }

  getDiscountedPrice(product: EcommerceProduct): number {
    const originalPrice = this.getProductPrice(product);

    if (!this.hasDiscount(product)) {
      return originalPrice;
    }

    const discountRate = 0.2;
    return originalPrice * (1 - discountRate);
  }

  isProductInStock(product: EcommerceProduct): boolean {
    return product.productItemQuantityInStock > 0;
  }

  getProductStock(product: EcommerceProduct): number {
    return product.productItemQuantityInStock || 0;
  }

  getVariationSummary(item: any): string {
    if (!item?.variations?.length) return 'Estándar';

    return item.variations
      .map((v: any) => v ? `${v.variationName || ''}: ${v.options || ''}` : '')
      .filter((text: string) => text.trim().length > 0)
      .join(', ') || 'Estándar';
  }

  getCompanyId(product: EcommerceProduct): number | null {
    return 1;
  }
}
