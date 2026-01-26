import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CompanyDtoLite, ResponseListPageableCompany } from '../../../../../../shared/models/users/company.interface';
import { CompanyService } from '../../../../../../core/services/users/company.service';

@Component({
  selector: 'app-company-list',
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.scss']
})
export class CompanyListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private router = inject(Router);
  private companyService = inject(CompanyService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  loading = this.companyService.loading;

  pageNo = signal<number>(0);
  pageSize = signal<number>(10);

  response = signal<ResponseListPageableCompany | null>(null);
  companies = computed(() => this.response()?.companyDtoList ?? []);

  ngOnInit(): void {
    this.load();
    this.companyService.refresh$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.load());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.companyService.getPageableCompanies(this.pageNo(), this.pageSize()).subscribe({
      next: (res) => this.response.set(res),
      error: () => this.toast('error', 'Error', 'No se pudo cargar el listado')
    });
  }

  create(): void {
    this.router.navigate(['/test/companies/create']);
  }

  detail(c: CompanyDtoLite): void {
    this.router.navigate(['/test/companies/detail', c.companyRuc]);
  }

  edit(c: CompanyDtoLite): void {
    // Si tu edit trabaja con id
    this.router.navigate(['/test/companies/edit', c.id]);
  }

  confirmDelete(c: CompanyDtoLite): void {
    this.confirmationService.confirm({
      message: `¿Eliminar la empresa con RUC "${c.companyRuc}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-outlined p-button-sm',
      accept: () => this.delete(c.id)
    });
  }

  delete(id: number): void {
    this.companyService.deleteCompany(id).subscribe({
      next: () => this.toast('success', 'Éxito', 'Empresa eliminada'),
      error: () => this.toast('error', 'Error', 'No se pudo eliminar (revisa endpoint delete)')
    });
  }

  onPage(event: any): void {
    this.pageNo.set(event.page);
    this.pageSize.set(event.rows);
    this.load();
  }

  refresh(): void {
    this.load();
  }

  private toast(sev: 'success'|'info'|'warn'|'error', sum: string, detail: string) {
    this.messageService.add({ severity: sev, summary: sum, detail, life: 3500 });
  }
}
