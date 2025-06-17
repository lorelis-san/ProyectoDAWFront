import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
    providedIn: 'root'
})
export class AlertService {

    success(title: string, text: string): void {
        Swal.fire({
            icon: 'success',
            title,
            text,
            timer: 2000,
            showConfirmButton: false
        });
    }

    error(title: string, text: string): void {
        Swal.fire({
            icon: 'error',
            title,
            text
        });
    }

    warning(title: string, text: string): void {
        Swal.fire({
            icon: 'warning',
            title,
            text
        });
    }
    confirmEdit(title: string, text: string): Promise<boolean> {
        return Swal.fire({
            title,
            text,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Sí, editar',
            cancelButtonText: 'Cancelar'
        }).then(result => result.isConfirmed);
    }

    confirmDelete(entity: string): Promise<boolean> {
        return Swal.fire({
            title: `¿Eliminar ${entity}?`,
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(result => result.isConfirmed);
    }

    requiredFields(): void {
        this.warning('Campos obligatorios', 'Por favor, completa todos los campos requeridos.');
    }
    confirm(message: string, title = '¿Estás seguro?'): Promise<boolean> {
        return Swal.fire({
            title,
            text: message,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar'
        }).then(result => result.isConfirmed);
    }

    loading(message = 'Procesando...') {
        Swal.fire({
            title: message,
            didOpen: () => {
                Swal.showLoading();
            },
            allowOutsideClick: false
        });
    }

    close() {
        Swal.close();
    }

}
