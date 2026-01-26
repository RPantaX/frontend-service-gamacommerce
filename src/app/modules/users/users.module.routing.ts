import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeesModule } from './pages/employees/employees.module';
import { UserGuard } from '../../../@security/guards/user.guard';
import { EnumRolesUsuario } from '../../../@utils/enums/EnumRoles';
const routes: Routes = [
  {
    path: 'employees',
    loadChildren: (): Promise<typeof EmployeesModule> =>
      import('./pages/employees/employees.module').then((m) => m.EmployeesModule),
  },
  {
    path: 'companies',
    loadChildren: (): Promise<any> => // Cambié el tipo de promesa a 'any' para simplificar
      import('./pages/companies/companies.module').then((m) => m.CompaniesModule),
    canLoad: [UserGuard], // Aplicar el guard para evitar la carga del módulo
    data: {
      rol: EnumRolesUsuario.SUPERADMIN // Pasa el rol SUPERADMIN como dato
    }
  },
  {
    path: 'users',
    loadChildren: (): Promise<typeof EmployeesModule> =>
      import('./pages/users/users.module').then((m) => m.UsersModule),
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
