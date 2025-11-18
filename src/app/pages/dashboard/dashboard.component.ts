import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CotizacionService } from '../../services/cotizacion.service';
import { Chart, registerables } from 'chart.js';
import { ProductService } from '../../services/product.service'

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  username: string = '';
  resumen: any = {
    cotizacionesMes: 0,
    cantidadCotizacionesMes: 0,
    aprobadas: 0,
    pendientes: 0,
    totalVentas: 0
  };

  cotizacionesRecientes: any[] = [];
  clientesTop: any[] = [];
  cotizacionesEstado: any[] = [];
  ingresosMes: any[] = [];
  ventasUsuario: any[] = [];
  topProductos: any[] = [];



  role: string | null = null;



  constructor(
    private authService: AuthService,
    private cotizacionService: CotizacionService,
    private productoService: ProductService
  ) { }



  ngOnInit(): void {
    this.username = this.authService.getUserNameFromToken() || 'Usuario';
    this.role = this.authService.getUserRole();
    this.cargarTopProductos();
    this.cargarDatosDashboard();
  }

  isAdmin(): boolean {
    return this.role === 'ROLE_ADMIN';
  }

  isUser(): boolean {
    return this.role === 'ROLE_USER';
  }


  cargarDatosDashboard() {

    // Cotizaciones pendientes
    this.cotizacionService.cotizacionesPendientes().subscribe({
      next: (res) => {
        this.cotizacionesRecientes = Array.isArray(res.data) ? res.data : [];
        this.resumen.pendientes = this.cotizacionesRecientes.length;
      },
      error: () => this.resumen.pendientes = 0
    });

    // Clientes top
    this.cotizacionService.clientesTop().subscribe({
      next: (res) => this.clientesTop = res.data || [],
      error: () => this.clientesTop = []
    });

    // Cotizaciones por estado
    this.cotizacionService.graficoCotizacionesPorEstado().subscribe({
      next: (res) => {
        this.cotizacionesEstado = res.data || [];
        this.crearGraficoCotizacionesEstado();
      },
      error: () => this.cotizacionesEstado = []
    });

    // Monto aprobadas mes
    this.cotizacionService.montoAprobadasMes().subscribe({
      next: (res) => {
        const data = res.data || {};
        this.resumen.cotizacionesMes = Number(data.montoAprobadoMes) || 0;
        this.resumen.cantidadCotizacionesMes = Number(data.cantidadAprobadas) || 0;

        this.resumen.aprobadas = Number(data.cantidadAprobadas) || 0;
      },
      error: () => {
        this.resumen.cotizacionesMes = 0;
        this.resumen.aprobadas = 0;
        this.resumen.cantidadCotizacionesMes = 0;

      }
    });

    // Ingresos por mes
    this.cotizacionService.ingresosPorMes().subscribe({
      next: (res) => {
        this.ingresosMes = res.data || [];
        this.resumen.totalVentas = this.ingresosMes.reduce(
          (acc: number, i: any) => acc + (Number(i.total) || 0),
          0
        );
        this.crearGraficoIngresosMes();
      },
      error: () => this.resumen.totalVentas = 0
    });

    // Ventas por usuario
    this.cotizacionService.ventasPorUsuario().subscribe({
      next: (res) => {
        this.ventasUsuario = res.data || [];
        this.crearGraficoVentasUsuario();
      },
      error: () => this.ventasUsuario = []
    });
  }

  // ====================== GRÁFICOS ============================

  crearGraficoCotizacionesEstado() {
    const labels = this.cotizacionesEstado.map(c => c.estado);
    const cantidades = this.cotizacionesEstado.map(c => Number(c.cantidad) || 0);
    const montos = this.cotizacionesEstado.map(c => Number(c.montoTotal) || 0);

    new Chart("cotizacionesEstadoChart", {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          label: 'Cotizaciones',
          data: montos,
          backgroundColor: ['#f8eb31ff', '#61ca6fff', '#d3330bff', '#9C27B0', '#FF5722', '#009688']
        }]
      },
      options: {
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const index = ctx.dataIndex;
                return [
                  `Estado: ${labels[index]}`,
                  `Cantidad: ${cantidades[index]}`,
                  `Monto: S/. ${montos[index].toFixed(2)}`
                ];
              }
            }
          }
        }
      }
    });
  }

  crearGraficoIngresosMes() {
    const labels = this.ingresosMes.map(i => i.mes);
    const cantidades = this.ingresosMes.map(i => Number(i.cotizacionesPorMes) || 0);
    const montos = this.ingresosMes.map(i => Number(i.total) || 0);

    new Chart("ingresosMesChart", {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Ingresos S/.',
          data: montos,
          backgroundColor: '#FF9800'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const index = ctx.dataIndex;
                return [
                  `Mes: ${labels[index]}`,
                  `Cantidad: ${cantidades[index]}`,
                  `Monto: S/. ${montos[index].toFixed(2)}`
                ];
              }
            }
          }
        }
      }
    });
  }

  crearGraficoVentasUsuario() {
    const labels = this.ventasUsuario.map(v => v.usuario);
    const cantidades = this.ventasUsuario.map(v => Number(v.cotizaciones) || 0);
    const montos = this.ventasUsuario.map(v => Number(v.total) || 0);

    new Chart("ventasUsuarioChart", {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Ventas S/.',
          data: montos,
          backgroundColor: '#2196F3'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const index = ctx.dataIndex;
                return [
                  `Usuario: ${labels[index]}`,
                  `Cantidad: ${cantidades[index]}`,
                  `Monto: S/. ${montos[index].toFixed(2)}`
                ];
              }
            }
          }
        }
      }
    });
  }

  ////////////////

  cargarTopProductos() {
    this.productoService.getTopProductos(5).subscribe({
      next: (resp) => {
        this.topProductos = resp.data;
      },
      error: (err) => {
        console.error("Error cargando top productos:", err);
      }
    });
  }

}
