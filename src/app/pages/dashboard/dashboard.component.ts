import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CotizacionService } from '../../services/cotizacion.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  username: string = '';
  resumen: any = {
    cotizacionesMes: 0, // monto aprobado del mes
    aprobadas: 0,       // cantidad aprobadas
    pendientes: 0,
    totalVentas: 0
  };

  cotizacionesRecientes: any[] = [];
  clientesTop: any[] = [];
  cotizacionesEstado: any[] = [];
  ingresosMes: any[] = [];
  ventasUsuario: any[] = [];

  constructor(
    private authService: AuthService,
    private cotizacionService: CotizacionService
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUserNameFromToken() || 'Usuario';
    this.cargarDatosDashboard();
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

    //  Clientes top
    this.cotizacionService.clientesTop().subscribe({
      next: (res) => {
        this.clientesTop = res.data || [];
      },
      error: () => this.clientesTop = []
    });

    //  Cotizaciones por estado (para el gráfico)
    this.cotizacionService.cotizacionesPorEstado().subscribe({
      next: (res) => {
        this.cotizacionesEstado = res.data || [];
        this.crearGraficoCotizacionesEstado();
      },
      error: () => this.cotizacionesEstado = []
    });

    // Monto de cotizaciones aprobadas del mes
    this.cotizacionService.montoAprobadasMes().subscribe({
      next: (res) => {
        const data = res.data || {};
        this.resumen.cotizacionesMes = Number(data.montoAprobadoMes) || 0;
        this.resumen.aprobadas = Number(data.cantidadAprobadas) || 0;
      },
      error: () => {
        this.resumen.cotizacionesMes = 0;
        this.resumen.aprobadas = 0;
      }
    });

    // Ingresos por mes (para el gráfico)
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

  // ======= Gráficos =======

  crearGraficoCotizacionesEstado() {
    const labels = this.cotizacionesEstado.map(c => c.estado);
    const data = this.cotizacionesEstado.map(c => Number(c.montoTotal) || 0);

    new Chart("cotizacionesEstadoChart", {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          label: 'Cotizaciones',
          data: data,
          backgroundColor: ['#4CAF50', '#FFC107', '#2196F3', '#9C27B0', '#FF5722', '#009688']
        }]
      },
      options: {
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  crearGraficoIngresosMes() {
    const labels = this.ingresosMes.map(i => i.mes);
    const data = this.ingresosMes.map(i => Number(i.total) || 0);

    new Chart("ingresosMesChart", {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Ingresos S/.',
          data: data,
          backgroundColor: '#FF9800'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    });
  }

  crearGraficoVentasUsuario() {
    const labels = this.ventasUsuario.map(v => v.usuario);
    const data = this.ventasUsuario.map(v => Number(v.total) || 0);

    new Chart("ventasUsuarioChart", {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Ventas S/.',
          data: data,
          backgroundColor: '#2196F3'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    });
  }
}
