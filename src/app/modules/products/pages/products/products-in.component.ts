import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ProductsService } from '../../../../core/services/products/products.service';
import { ResponsePageableProducts, ResponseProduct } from '../../../../shared/models/products/product.interface';
import { filter, finalize, switchMap, take, takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User } from '../../../../shared/models/auth/auth.interface';
import { Store } from '@ngrx/store';
import { SecurityState } from '../../../../../@security/interfaces/SecurityState';

@Component({
  selector: 'app-products-in-page',
  templateUrl: './products-in.component.html',
  styleUrls: ['./products-in.component.scss']
})
export class ProductInComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private store: Store<SecurityState> = inject(Store);
  // Signals
  public products = signal<ResponsePageableProducts | null>(null);
  public productList = computed(() => this.products()?.responseProductList ?? []);
  public isLoading = signal<boolean>(true);
  public layout = signal<'list' | 'grid'>('grid');
  public layoutOptions = [
    { label: 'Lista', value: 'list', icon: 'pi pi-bars' },
    { label: 'Cuadrícula', value: 'grid', icon: 'pi pi-th-large' }
  ];
  //constant companyId
  companyId: number = 1; // The companyId will be set in the backend according to the logged in user
  public productDialog = signal<boolean>(false);
  currentUserSession$: Observable<User | null>;
  currentUserSession: User | null = null;
  constructor() {
    this.currentUserSession$ = this.store.select(state => state.userState.user);
  }

  ngOnInit(): void {
    this.loadPageableProducts();
  }

  loadPageableProducts(): void {
    this.currentUserSession$
    .pipe(
      // Filtra nulos y asegura que tengamos el objeto User
                    filter(user => user !== null && user.company.id !== undefined),
                    // Obtén solo el valor actual e inmediatamente desuscríbete
                    take(1),
                    // Usa switchMap para cambiar al Observable de la llamada al servicio
                    switchMap(user => {
                      this.companyId = user!.company.id;
                      this.isLoading.set(true);
                      return this.productsService.getPageableProductsByCompanyId(this.companyId)
                        .pipe(finalize(() => this.isLoading.set(false)));
                    }

    )
  ).subscribe(apiResponse => {
        this.products.set(apiResponse);
      });
  }

  getInventoryStatus(product: ResponseProduct): { status: string; severity: 'success' | 'warning' | 'danger' } {
    if (product?.responseProductItemDetails && product.responseProductItemDetails.length > 0) {
      const totalStock = product.responseProductItemDetails.reduce((acc, item) => acc + item.productItemQuantityInStock, 0);
      if (totalStock > 10) return { status: 'EN STOCK', severity: 'success' };
      if (totalStock > 0) return { status: 'STOCK BAJO', severity: 'warning' };
    }
    return { status: 'SIN STOCK', severity: 'danger' };
  }

  openNew(): void { this.productDialog.set(true); }
  hideDialog(refresh: boolean = false): void {
    this.productDialog.set(false);
    if (refresh) {
      this.loadPageableProducts();
    }
  }
}
