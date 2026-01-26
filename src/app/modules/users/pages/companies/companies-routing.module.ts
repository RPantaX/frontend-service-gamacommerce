import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompanyListComponent } from './pages/company-list/company-list.component';
import { CompanyFormComponent } from './pages/company-form/company-form.component';
import { CompanyDetailComponent } from './pages/company-detail/company-detail.component';

const routes: Routes = [
  { path: '', component: CompanyListComponent },
  { path: 'create', component: CompanyFormComponent, data: { mode: 'create' } },
  { path: 'edit/:id', component: CompanyFormComponent, data: { mode: 'edit' } },
  { path: 'detail/:ruc', component: CompanyDetailComponent } // trabajamos por RUC (según tu API)
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompaniesRoutingModule {}
