import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OfficeService, OfficeCreateRequest } from '../../../../core/services/office.service';
import { Office } from '../../../../core/models/dashboard.modules';

export interface OfficeFormDialogData {
  office: Office | null; // null = creando, con valor = editando
  companyId: number;
}

interface DayOption {
  value: number;
  label: string;
}

@Component({
  selector: 'app-office-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './office-form-dialog.html',
  styleUrl: './office-form-dialog.scss'
})
export class OfficeFormDialog {
  private dialogRef = inject(MatDialogRef<OfficeFormDialog>);
  private officeService = inject(OfficeService);
  data = inject<OfficeFormDialogData>(MAT_DIALOG_DATA);

  isEditMode = !!this.data.office;

  name = this.data.office?.name ?? '';
  address = this.data.office?.address ?? '';
  city = this.data.office?.city ?? '';
  openingTime = this.data.office?.openingTime?.slice(0, 5) ?? '07:00';
  closingTime = this.data.office?.closingTime?.slice(0, 5) ?? '17:00';

  dayOptions: DayOption[] = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
    { value: 0, label: 'Domingo' }
  ];

  selectedDays = new Set<number>(
    this.data.office?.workingDays
      ? this.data.office.workingDays.split(',').map(d => parseInt(d.trim(), 10))
      : [1, 2, 3, 4, 5]
  );

  loading = signal(false);
  errorMessage = signal('');

  toggleDay(day: number): void {
    if (this.selectedDays.has(day)) {
      this.selectedDays.delete(day);
    } else {
      this.selectedDays.add(day);
    }
  }

  isDaySelected(day: number): boolean {
    return this.selectedDays.has(day);
  }

  close(): void {
    this.dialogRef.close(false);
  }

  save(): void {
  if (!this.name.trim() || !this.address.trim() || !this.city.trim()) {
    this.errorMessage.set('Completa todos los campos.');
    return;
  }

  if (this.selectedDays.size === 0) {
    this.errorMessage.set('Selecciona al menos un día laboral.');
    return;
  }

  if (this.openingTime >= this.closingTime) {
    this.errorMessage.set('La hora de apertura debe ser anterior a la de cierre.');
    return;
  }

  const payload: OfficeCreateRequest = {
    name: this.name.trim(),
    address: this.address.trim(),
    city: this.city.trim(),
    companyId: this.data.companyId,
    openingTime: `${this.openingTime}:00`,
    closingTime: `${this.closingTime}:00`,
    workingDays: Array.from(this.selectedDays).sort().join(',')
  };

  this.loading.set(true);
  this.errorMessage.set('');

  const onSuccess = () => {
    this.loading.set(false);
    this.dialogRef.close(true);
  };

  const onError = (err: unknown) => {
    this.loading.set(false);
    const httpError = err as { error?: unknown };
    this.errorMessage.set(
      typeof httpError.error === 'string' ? httpError.error : 'No se pudo guardar la oficina.'
    );
  };

  if (this.isEditMode) {
    this.officeService.update(this.data.office!.id, payload).subscribe({
      next: onSuccess,
      error: onError
    });
  } else {
    this.officeService.create(payload).subscribe({
      next: onSuccess,
      error: onError
    });
  }
}
}
