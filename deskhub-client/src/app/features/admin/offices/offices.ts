import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { OfficeService } from '../../../core/services/office.service';
import { AuthService } from '../../../core/services/auth.service';
import { Office } from '../../../core/models/dashboard.modules';
import { OfficeFormDialog } from './office-form-dialog/office-form-dialog';

const DAY_LABELS: Record<number, string> = {
  0: 'Dom', 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb'
};

@Component({
  selector: 'app-offices',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatChipsModule
  ],
  templateUrl: './offices.html',
  styleUrl: './offices.scss'
})
export class Offices implements OnInit {
  private officeService = inject(OfficeService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  loading = signal(true);
  offices = signal<Office[]>([]);
  displayedColumns = ['name', 'city', 'hours', 'days', 'actions'];

  currentUser = this.authService.currentUser;

  ngOnInit(): void {
    this.loadOffices();
  }

  loadOffices(): void {
    this.loading.set(true);
    this.officeService.getAll().subscribe({
      next: (offices) => {
        this.offices.set(offices);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  formatDays(workingDays: string): string {
    return workingDays
      .split(',')
      .map(d => DAY_LABELS[parseInt(d.trim(), 10)])
      .join(', ');
  }

  formatTime(time: string): string {
    return time?.slice(0, 5) ?? '';
  }

  openCreateDialog(): void {
    const companyId = this.currentUser()?.companyId;
    if (!companyId) return;

    const dialogRef = this.dialog.open(OfficeFormDialog, {
      data: { office: null, companyId }
    });

    dialogRef.afterClosed().subscribe((saved: boolean) => {
      if (saved) this.loadOffices();
    });
  }

  openEditDialog(office: Office): void {
    const dialogRef = this.dialog.open(OfficeFormDialog, {
      data: { office, companyId: office.companyId }
    });

    dialogRef.afterClosed().subscribe((saved: boolean) => {
      if (saved) this.loadOffices();
    });
  }

  deleteOffice(office: Office): void {
    const confirmed = confirm(`¿Seguro que quieres eliminar "${office.name}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    this.officeService.delete(office.id).subscribe({
      next: () => this.loadOffices(),
      error: () => alert('No se pudo eliminar la oficina. Puede que tenga espacios o usuarios asociados.')
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
