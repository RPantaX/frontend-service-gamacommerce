import { Component, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CatalogItem, CreateCompanyRequest, CompanyDetailDto, ContractKindDto } from '../../../../../../shared/models/users/company.interface';
import { CompanyService } from '../../../../../../core/services/users/company.service';
import { Console } from 'console';

@Component({
  selector: 'app-company-form',
  templateUrl: './company-form.component.html',
  styleUrls: ['./company-form.component.scss']
})
export class CompanyFormComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private companyService = inject(CompanyService);
  private messageService = inject(MessageService);

  isEditMode = false;

  // Signals para manejo de imágenes
  private readonly _isSubmitting = signal<boolean>(false);
  private readonly _selectedFile = signal<File | null>(null);
  private readonly _imagePreview = signal<string | null>(null);
  private readonly _hasImageChanged = signal<boolean>(false);
  private readonly _shouldDeleteImage = signal<boolean>(false);
  private readonly _originalImageUrl = signal<string | null>(null);

  // Computed signals
  readonly isSubmitting = () => this._isSubmitting();
  readonly selectedFile = () => this._selectedFile();
  readonly imagePreview = () => this._imagePreview();
  readonly hasImageChanged = () => this._hasImageChanged();
  readonly shouldDeleteImage = () => this._shouldDeleteImage();

  mode = signal<'create' | 'edit'>('create');
  companyId = signal<number | null>(null);

  documentTypes = signal<CatalogItem[]>([]);
  companyTypes = signal<CatalogItem[]>([]);
  contractKinds = signal<ContractKindDto[]>([]);

  loading = this.companyService.loading;

  form = this.fb.group({
    // PERSON
    personDocumentId: [null as number | null, [Validators.required]],
    personDocumentNumber: ['', [Validators.required, Validators.minLength(6)]],
    personName: ['', [Validators.required]],
    personLastName: ['', [Validators.required]],
    personPhoneNumber: ['', [Validators.required]],
    personEmailAddress: ['', [Validators.required, Validators.email]],
    personAddressStreet: ['', [Validators.required]],
    personAddressCity: ['', [Validators.required]],
    personAddressState: ['', [Validators.required]],
    personAddressPostalCode: ['', [Validators.required]],
    personAddressCountry: ['', [Validators.required]],

    // COMPANY
    companyTypeId: [null as number | null, [Validators.required]],
    companyDocumentId: [null as number | null, [Validators.required]],
    companyTradeName: ['', [Validators.required]],
    companyRUC: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    companyPhone: ['', [Validators.required]],
    companyEmail: ['', [Validators.required, Validators.email]],
    image: [''],
    // CONTRACT
    contractTimeMonth: [12, [Validators.required, Validators.min(1)]],
    contractKindId: [null as number | null, [Validators.required]],
  });

  title = computed(() => this.mode() === 'create' ? 'Crear Empresa' : 'Editar Empresa');

  ngOnInit(): void {
    this.mode.set((this.route.snapshot.data['mode'] || 'create') as any);

    const idParam = this.route.snapshot.params['id'];
    if (this.mode() === 'edit') {
      this.companyId.set(idParam ? +idParam : null);
      this.isEditMode = true;
    }

    this.loadCatalogs();
  }

  private loadCatalogs(): void {
    this.companyService.getCatalogs().subscribe({
      next: ({ documentTypes, companyTypes }) => {
        this.documentTypes.set(documentTypes);
        this.companyTypes.set(companyTypes);

        // Cargar tipos de contrato manualmente si no existe el endpoint
        // Por ahora uso datos mock basados en el JSON de respuesta
        this.contractKinds.set([
          { id: 1, value: 'PRUEBA_PRIMERA_VEZ' },
          { id: 2, value: 'CONTRATO_ANUAL' },
          { id: 3, value: 'CONTRATO_MENSUAL' }
        ]);
      },
      error: () => this.toast('error', 'Error', 'No se pudieron cargar catálogos')
    });
  }

  submit(): void {
    console.log('Formulario válido, preparando para enviar:', this.form.value);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.toast('warn', 'Validación', 'Completa todos los campos obligatorios');
      return;
    }
    this._isSubmitting.set(true);

    const payload: CreateCompanyRequest = {
      person: {
        personDocumentNumber: this.form.value.personDocumentNumber!,
        personName: this.form.value.personName!,
        personLastName: this.form.value.personLastName!,
        personPhoneNumber: this.form.value.personPhoneNumber!,
        personEmailAddress: this.form.value.personEmailAddress!,
        personAddressStreet: this.form.value.personAddressStreet!,
        personAddressCity: this.form.value.personAddressCity!,
        personAddressState: this.form.value.personAddressState!,
        personAddressPostalCode: this.form.value.personAddressPostalCode!,
        personAddressCountry: this.form.value.personAddressCountry!,
        personDocumentId: this.form.value.personDocumentId!,
      },
      company: {
        contractRequest: {
          contractTimeMonth: this.form.value.contractTimeMonth!,
          contractKindId: this.form.value.contractKindId!,
        },
        companyTypeId: this.form.value.companyTypeId!,
        companyDocumentId: this.form.value.companyDocumentId!,
        companyTradeName: this.form.value.companyTradeName!,
        companyRUC: this.form.value.companyRUC!,
        companyPhone: this.form.value.companyPhone!,
        companyEmail: this.form.value.companyEmail!
      }
    };

    // Manejar imagen
    if (this.selectedFile()) {
      // Convertir la imagen a Base64
      this.convertFileToBase64(this.selectedFile()!).then(base64 => {
        payload.company.image = this.selectedFile()!;
        this.executeSubmit(payload);
      }).catch(() => {
        this.toast('error', 'Error', 'No se pudo procesar la imagen');
        this._isSubmitting.set(false);
      });
    } else if (this.shouldDeleteImage() && this.isEditMode) {
      // Marcar para eliminar imagen (esto depende de cómo tu backend maneje la eliminación)
      payload.company.deleteFile = true;
      this.executeSubmit(payload);

    } else {
      payload.company.deleteFile = true;
      this.executeSubmit(payload);

    }
  }

  private executeSubmit(payload: CreateCompanyRequest): void {
    if (this.mode() === 'create') {
      this.companyService.createCompany(payload).subscribe({
        next: () => {
          this.toast('success', 'Éxito', 'Empresa creada correctamente');
          this.resetImageState();
          this.router.navigate(['/test/companies']);
        },
        error: (err) => this.handleBackendError(err),
        complete: () => this._isSubmitting.set(false)
      });
    } else {
      const id = this.companyId();
      if (!id) {
        this.toast('error', 'Error', 'ID inválido para edición');
        this._isSubmitting.set(false);
        return;
      }
      this.companyService.updateCompany(id, payload).subscribe({
        next: () => {
          this.toast('success', 'Éxito', 'Empresa actualizada correctamente');
          this.resetImageState();
          this.router.navigate(['/test/companies']);
        },
        error: (err) => this.handleBackendError(err),
        complete: () => this._isSubmitting.set(false)
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/test/companies']);
    this.resetImageState();
    this._isSubmitting.set(false);
  }

  private handleBackendError(err: any): void {
    const code = err?.error?.code;
    const msg = err?.error?.message || 'Error inesperado';

    if (code === 'ERCO00012') return this.toast('error', 'RUC duplicado', msg);
    if (code === 'ERCO00013') return this.toast('error', 'Email empresa duplicado', msg);
    if (code === 'ERCO00014') return this.toast('error', 'Razón comercial duplicada', msg);
    if (code === 'WAR00011') return this.toast('warn', 'Email usuario duplicado', msg);
    if (code === 'WAR00013') return this.toast('warn', 'Documento usuario duplicado', msg);

    this._isSubmitting.set(false);
    return this.toast('error', 'Error', msg);
  }

  private toast(sev: 'success'|'info'|'warn'|'error', sum: string, detail: string) {
    this.messageService.add({ severity: sev, summary: sum, detail, life: 4000 });
  }

  hasError(name: string, error: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.touched && c.hasError(error));
  }

  // Métodos de imagen

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const validation = this.validateImageFile(file);

      if (!validation.isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Archivo inválido',
          detail: validation.error
        });
        this.resetImageSelection();
        return;
      }

      this._selectedFile.set(file);
      this._hasImageChanged.set(true);
      this._shouldDeleteImage.set(false);

      // Generar previsualización
      const reader = new FileReader();
      reader.onload = () => {
        this._imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    if (this.isEditMode && this._originalImageUrl()) {
      this._shouldDeleteImage.set(true);
      this._hasImageChanged.set(true);
    }

    this._selectedFile.set(null);
    this._imagePreview.set(null);

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private resetImageSelection(): void {
    this._selectedFile.set(null);

    if (this.isEditMode && this._originalImageUrl()) {
      this._imagePreview.set(this._originalImageUrl());
      this._hasImageChanged.set(false);
      this._shouldDeleteImage.set(false);
    } else {
      this._imagePreview.set(null);
    }

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private resetImageState(): void {
    this._selectedFile.set(null);
    this._hasImageChanged.set(false);
    this._shouldDeleteImage.set(false);

    if (!this.isEditMode) {
      this._imagePreview.set(null);
      this._originalImageUrl.set(null);
    }

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private validateImageFile(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Formato de archivo no soportado. Use JPG, PNG, GIF o WebP.' };
    }
    if (file.size > maxSizeInBytes) {
      return { isValid: false, error: 'La imagen no debe exceder los 5MB.' };
    }
    return { isValid: true };
  }

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remover el prefijo "data:image/...;base64," si tu backend solo espera la cadena base64
        const base64String = base64.split(',')[1] || base64;
        resolve(base64String);
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(file);
    });
  }
}
