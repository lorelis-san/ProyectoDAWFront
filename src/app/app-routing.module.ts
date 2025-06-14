import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component'; 
import { RegisterComponent } from './pages/register/register.component'; 
import { VehicleListComponent } from './components/vehicle/vehicle-list/vehicle-list.component';
import { VehicleFormComponent } from './components/vehicle/vehicle-form/vehicle-form.component';
import { CategoryListComponent } from './components/category/category-list/category-list.component';
import { CategoryFormComponent } from './components/category/category-form/category-form.component';
import { SupplierListComponent } from './components/supplier/supplier-list/supplier-list.component';
import { SupplierFormComponent } from './components/supplier/supplier-form/supplier-form.component';
import { ClientListComponent } from './components/client/client-list/client-list.component';
import { ClientFormComponent } from './components/client/client-form/client-form.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from './components/helpers/auth.guard';
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'clientes', component: ClientListComponent ,canActivate: [AuthGuard]},
      { path: 'clientes/nuevo', component: ClientFormComponent },
      { path: 'clientes/editar/:id', component: ClientFormComponent },
      { path: 'vehiculos', component: VehicleListComponent },
      { path: 'vehiculos/nuevo', component: VehicleFormComponent },
      { path: 'categorias', component: CategoryListComponent },
      { path: 'categorias/nuevo', component: CategoryFormComponent },
      { path: 'proveedores', component: SupplierListComponent },
      { path: 'proveedores/nuevo', component: SupplierFormComponent }
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
