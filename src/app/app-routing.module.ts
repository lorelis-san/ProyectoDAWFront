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
import { ProductFormComponent } from './components/product/product-form/product-form.component';
import { ProductListComponent } from './components/product/product-list/product-list.component';
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent,canActivate: [AuthGuard] },
      { path: 'clientes', component: ClientListComponent ,canActivate: [AuthGuard]},
      { path: 'clientes/nuevo', component: ClientFormComponent,canActivate: [AuthGuard] },
      { path: 'clientes/editar/:id', component: ClientFormComponent,canActivate: [AuthGuard] },
      { path: 'vehiculos', component: VehicleListComponent,canActivate: [AuthGuard] },
      { path: 'vehiculos/nuevo', component: VehicleFormComponent,canActivate: [AuthGuard] },
      { path: 'vehiculos/editar/:id', component: VehicleFormComponent, canActivate: [AuthGuard] },
      { path: 'categorias', component: CategoryListComponent,canActivate: [AuthGuard] },
      { path: 'categorias/nuevo', component: CategoryFormComponent,canActivate: [AuthGuard] },
      { path: 'categorias/editar/:id', component: CategoryFormComponent, canActivate: [AuthGuard] },
      { path: 'suppliers', component: SupplierListComponent, canActivate: [AuthGuard] },
      { path: 'suppliers/new', component: SupplierFormComponent, canActivate: [AuthGuard] },
      { path: 'suppliers/edit/:id', component: SupplierFormComponent, canActivate: [AuthGuard] },
      { path: 'productos', component: ProductListComponent, canActivate: [AuthGuard] },
      { path: 'productos/nuevo', component: ProductFormComponent, canActivate: [AuthGuard] },
      { path: 'productos/editar/:id', component: ProductFormComponent, canActivate: [AuthGuard] }


    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
