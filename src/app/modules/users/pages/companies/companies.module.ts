import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PanelModule } from 'primeng/panel';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';

import { ConfirmationService, MessageService } from 'primeng/api';

import { CompaniesRoutingModule } from './companies-routing.module';
import { CompanyListComponent } from './pages/company-list/company-list.component';
import { CompanyFormComponent } from './pages/company-form/company-form.component';
import { CompanyDetailComponent } from './pages/company-detail/company-detail.component';

@NgModule({
  declarations: [
    CompanyListComponent,
    CompanyFormComponent,
    CompanyDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CompaniesRoutingModule,

    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    ToolbarModule,
    InputTextareaModule,
    TagModule,
    ProgressSpinnerModule,
    PanelModule,
    DividerModule,
    TooltipModule,
    CardModule
  ],
  providers: [ConfirmationService, MessageService]
})
export class CompaniesModule {}
