import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CompanyService } from '../../../../../../core/services/users/company.service';
import { CompanyDetailDto } from '../../../../../../shared/models/users/company.interface';

@Component({
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.scss']
})
export class CompanyDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  company: CompanyDetailDto | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private companyService: CompanyService
  ) {}

  ngOnInit(): void {
    const ruc = this.route.snapshot.params['ruc'] || this.route.snapshot.queryParams['ruc'];

    if (ruc) {
      this.loadByRUC(ruc);
    } else {
      this.error = 'No se proporcionó un RUC válido';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadByRUC(ruc: string): void {
    this.loading = true;
    this.error = null;

    this.companyService.findByRUC(ruc)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.company = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = err?.message || 'Error al cargar los datos de la empresa';
          this.loading = false;
          console.error('Error loading company:', err);
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/test/companies']);
  }

  editCompany(): void {
    if (this.company) {
      this.router.navigate(['/test/companies/edit', this.company.id]);
    }
  }

  getContractStatusSeverity(active: boolean): 'success' | 'danger'  {
    return active ? 'success' : 'danger';
  }

  getContractStatusLabel(active: boolean): string {
    return active ? 'Activo' : 'Inactivo';
  }
}
