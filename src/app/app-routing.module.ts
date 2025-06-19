import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component'; 
import { RegisterComponent } from './pages/register/register.component'; 
import { VehicleListComponent } from './components/vehicle/vehicle-list/vehicle-list.component';
import { CategoryListComponent } from './components/category/category-list/category-list.component';
import { SupplierListComponent } from './components/supplier/supplier-list/supplier-list.component';
import { ClientListComponent } from './components/client/client-list/client-list.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from './components/helpers/auth.guard';
import { ProductFormComponent } from './components/product/product-form/product-form.component';
import { ProductListComponent } from './components/product/product-list/product-list.component';
import { CotizacionFormComponent } from './components/cotizacion-form/cotizacion-form.component';
import { CotizacionListComponent } from './components/cotizacion-list/cotizacion-list.component';
import { AuthInterceptor } from './components/helpers/auth.interceptor';

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
      { path: 'vehiculos', component: VehicleListComponent,canActivate: [AuthGuard] },
      { path: 'categorias', component: CategoryListComponent,canActivate: [AuthGuard] },
      { path: 'suppliers', component: SupplierListComponent, canActivate: [AuthGuard] },
      { path: 'productos', component: ProductListComponent, canActivate: [AuthGuard] },
      { path: 'productos/nuevo', component: ProductFormComponent, canActivate: [AuthGuard] },
      { path: 'productos/editar/:id', component: ProductFormComponent, canActivate: [AuthGuard] },
      { path: 'cotizaciones', component: CotizacionListComponent,canActivate: [AuthGuard] },
      { path: 'cotizaciones/nueva', component: CotizacionFormComponent,canActivate: [AuthGuard] },
      { path: 'cotizaciones/editar/:id', component: CotizacionFormComponent ,canActivate: [AuthGuard]},
     
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
   providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
   bootstrap: [AppComponent]
})
export class AppRoutingModule { }
