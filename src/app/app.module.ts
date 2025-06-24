import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { VehicleListComponent } from './components/vehicle/vehicle-list/vehicle-list.component';

import { CategoryListComponent } from './components/category/category-list/category-list.component';

import { SupplierListComponent } from './components/supplier/supplier-list/supplier-list.component';

import { ClientListComponent } from './components/client/client-list/client-list.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthGuard } from './components/helpers/auth.guard';
import { AuthInterceptor } from './components/helpers/auth.interceptor';
import { ProductListComponent } from './components/product/product-list/product-list.component';
import { ProductFormComponent } from './components/product/product-form/product-form.component';
import { CotizacionFormComponent } from './components/cotizacion-form/cotizacion-form.component';
import { CotizacionListComponent } from './components/cotizacion-list/cotizacion-list.component';
import { ProductDetailComponent } from './components/product/product-detail/product-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    VehicleListComponent,
    CategoryListComponent,
    SupplierListComponent,
    ClientListComponent,
    MainLayoutComponent,
    SidebarComponent,
    NavbarComponent,
    DashboardComponent,
    ProductListComponent,
    ProductFormComponent,
    ProductDetailComponent,
    CotizacionFormComponent,
    CotizacionListComponent,
    ProductDetailComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule, 
    AppRoutingModule,
    RouterModule.forRoot([
      {path: 'productos', component: ProductListComponent, canActivate: [AuthGuard]},
      {path: 'login', component: LoginComponent},
      {path: '', component: LoginComponent},
    ]),
  ],
  providers: [
     {
      provide : HTTP_INTERCEPTORS, useClass : AuthInterceptor, multi : true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
