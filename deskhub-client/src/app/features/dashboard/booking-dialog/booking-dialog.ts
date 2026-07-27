import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { Space } from '../../../core/models/dashboard.modules';

export interface BookingDialogData {
  space: Space;
}

@Component({
  selector: 'app-booking-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './booking-dialog.html',
  styleUrl: './booking-dialog.scss'
})
export class BookingDialog {
  private dialogRef = inject(MatDialogRef<BookingDialog>);
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);
  data = inject<BookingDialogData>(MAT_DIALOG_DATA);

  today = new Date();
  date: Date | null = null;
  startHour = '09:00';
  endHour = '10:00';

  loading = signal(false);
  errorMessage = signal('');

  close(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    const user = this.authService.currentUser();

    if (!user) {
      this.errorMessage.set('Sesión no válida. Inicia sesión de nuevo.');
      return;
    }

    if (!this.date) {
      this.errorMessage.set('Selecciona una fecha.');
      return;
    }

    if (!this.startHour || !this.endHour) {
      this.errorMessage.set('Selecciona la hora de inicio y fin.');
      return;
    }

    const startTime = this.combineDateAndTime(this.date, this.startHour);
    const endTime = this.combineDateAndTime(this.date, this.endHour);

    this.loading.set(true);
    this.errorMessage.set('');

    this.bookingService.create({
      userId: user.userId,
      spaceId: this.data.space.id,
      startTime,
      endTime
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          typeof err.error === 'string' ? err.error : 'No se pudo crear la reserva.'
        );
      }
    });
  }

  private combineDateAndTime(date: Date, time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');

  return `${year}-${month}-${day}T${hh}:${mm}:00`;
  }
}
