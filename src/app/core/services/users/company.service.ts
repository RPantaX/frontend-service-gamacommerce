import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, map, tap, catchError, throwError, forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environments.prod';
import {
  ApiResponse,
  CatalogItem,
  CompanyDetailDto,
  ContractKindDto,
  CreateCompanyRequest,
  CreateCompanyResponse,
  ResponseListPageableCompany
} from '../../../shared/models/users/company.interface';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private http = inject(HttpClient);

  private baseUrl = environment.baseUrl + '/user-service/company';
  private docUrl = environment.baseUrl + '/user-service/document';
  private contractKindUrl = environment.baseUrl + '/user-service/contractKind';
  private companyTypesUrl = environment.baseUrl + '/user-service/company/types';

  // Signals
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // refresh
  private refreshSubject = new Subject<void>();
  refresh$ = this.refreshSubject.asObservable();

  get loading() { return this.loadingSignal.asReadonly(); }
  get error() { return this.errorSignal.asReadonly(); }

  // ================= CATALOGS =================
  getDocumentTypes(): Observable<CatalogItem[]> {
    return this.http.get<ApiResponse<CatalogItem[]>>(`${this.docUrl}/findAll`).pipe(
      map(r => r.data)
    );
  }
  getContractKinds(): Observable<ContractKindDto[]> {
    return this.http.get<ApiResponse<ContractKindDto[]>>(`${this.contractKindUrl}/findAll`).pipe(
      map(r => r.data)
    );
  }

  getCompanyTypes(): Observable<CatalogItem[]> {
    return this.http.get<ApiResponse<CatalogItem[]>>(`${this.companyTypesUrl}/findAll`).pipe(
      map(r => r.data)
    );
  }

  getCatalogs(): Observable<{ documentTypes: CatalogItem[]; companyTypes: CatalogItem[]; contractKinds: ContractKindDto[] }> {
    return forkJoin({
      documentTypes: this.getDocumentTypes(),
      companyTypes: this.getCompanyTypes(),
      contractKinds: this.getContractKinds()
    });
  }

  // ================= CRUD =================
  getPageableCompanies(
    pageNo: number = 0,
    pageSize: number = 10,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Observable<ResponseListPageableCompany> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const params = new HttpParams()
      .set('pageNo', pageNo.toString())
      .set('pageSize', pageSize.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http
      .get<ApiResponse<ResponseListPageableCompany>>(`${this.baseUrl}/list/pageable`, { params })
      .pipe(
        map(r => r.data),
        tap(() => this.loadingSignal.set(false)),
        catchError(err => {
          this.loadingSignal.set(false);
          this.errorSignal.set(err?.message || 'Error loading companies');
          return throwError(() => err);
        })
      );
  }

  findByRUC(ruc: string): Observable<CompanyDetailDto> {
    this.loadingSignal.set(true);
    const params = new HttpParams().set('RUC', ruc);

    return this.http
      .get<ApiResponse<CompanyDetailDto>>(`${this.baseUrl}/findByRUC`, { params })
      .pipe(
        map(r => r.data),
        tap(() => this.loadingSignal.set(false))
      );
  }

  createCompany(payload: CreateCompanyRequest): Observable<CreateCompanyResponse> {
      this.loadingSignal.set(true);

      const formData = this.buildFormDataForCompany(payload);

      return this.http
        .post<ApiResponse<CreateCompanyResponse>>(`${this.baseUrl}/create`, formData)
        .pipe(
          map(r => r.data),
          tap(() => {
            this.loadingSignal.set(false);
            this.refresh();
          }),
          catchError(err => {
            this.loadingSignal.set(false);
            return throwError(() => err);
          })
        );
  }

  // ======= AJUSTA ESTAS RUTAS SI TU BACKEND ES DISTINTO =======
  updateCompany(companyId: number, payload: CreateCompanyRequest): Observable<boolean> {
      this.loadingSignal.set(true);

      const formData = this.buildFormDataForCompany(payload);

      return this.http
        .put<ApiResponse<boolean>>(`${this.baseUrl}/update/${companyId}`, formData)
        .pipe(
          map(r => r.data),
          tap(() => {
            this.loadingSignal.set(false);
            this.refresh();
          })
        );
  }

  deleteCompany(companyId: number): Observable<boolean> {
    this.loadingSignal.set(true);
    return this.http
      .delete<ApiResponse<boolean>>(`${this.baseUrl}/delete/${companyId}`)
      .pipe(
        map(r => r.data),
        tap(() => {
          this.loadingSignal.set(false);
          this.refresh();
        })
      );
  }

  refresh(): void {
    this.refreshSubject.next();
  }

  clearError(): void {
    this.errorSignal.set(null);
  }
  // En tu CompanyService o UserService
private buildFormDataForCompany(companyRequest: CreateCompanyRequest): FormData {
    const formData = new FormData();

    // 1. Campos anidados de la Persona (person)
    // El formato esperado por @ModelAttribute para objetos anidados es:
    // nombre_del_campo_padre.nombre_del_campo_hijo

    // Campos directos de 'person'
    formData.append('person.personDocumentNumber', companyRequest.person.personDocumentNumber);
    formData.append('person.personName', companyRequest.person.personName);
    formData.append('person.personLastName', companyRequest.person.personLastName);
    formData.append('person.personPhoneNumber', companyRequest.person.personPhoneNumber);
    formData.append('person.personEmailAddress', companyRequest.person.personEmailAddress);
    formData.append('person.personAddressStreet', companyRequest.person.personAddressStreet);
    formData.append('person.personAddressCity', companyRequest.person.personAddressCity);
    formData.append('person.personAddressState', companyRequest.person.personAddressState);
    formData.append('person.personAddressPostalCode', companyRequest.person.personAddressPostalCode);
    formData.append('person.personAddressCountry', companyRequest.person.personAddressCountry);
    formData.append('person.personDocumentId', companyRequest.person.personDocumentId.toString());

    // 2. Campos anidados de la Empresa (company)
    // Campos directos de 'company'
    formData.append('company.companyTypeId', companyRequest.company.companyTypeId.toString());
    formData.append('company.companyDocumentId', companyRequest.company.companyDocumentId.toString());
    formData.append('company.companyTradeName', companyRequest.company.companyTradeName);
    formData.append('company.companyRUC', companyRequest.company.companyRUC);
    formData.append('company.companyPhone', companyRequest.company.companyPhone);
    formData.append('company.companyEmail', companyRequest.company.companyEmail);

    // Sub-objeto anidado: contractRequest
    formData.append('company.contractRequest.contractTimeMonth', companyRequest.company.contractRequest.contractTimeMonth.toString());
    formData.append('company.contractRequest.contractKindId', companyRequest.company.contractRequest.contractKindId.toString());

    // 3. Archivo de imagen (image) y flag de eliminación (deleteFile)
    // Adjuntar imagen si existe y es un File
    if (companyRequest.company.image && companyRequest.company.image instanceof File) {
        // 'image' debe coincidir con el nombre de la propiedad en CreateCompanyRequest.company
        formData.append('company.image', companyRequest.company.image);
    }

    // Adjuntar flag de eliminación de archivo
    if (companyRequest.company.deleteFile === true) {
        formData.append('company.deleteFile', 'true');
    } else {
        // Asegurarse de enviarlo, aunque sea 'false'
        formData.append('company.deleteFile', 'false');
    }

    return formData;
}
}
