import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../core/models/dashboard.modules';

type StatusFilter = 'all' | 'Confirmed' | 'Cancelled' | 'Completed';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './bookings.html',
  styleUrl: './bookings.scss'
})
export class Bookings implements OnInit {
  private bookingService = inject(BookingService);
  private router = inject(Router);

  loading = signal(true);
  allBookings = signal<Booking[]>([]);
  statusFilter = signal<StatusFilter>('all');
  displayedColumns = ['user', 'space', 'office', 'startTime', 'endTime', 'status', 'actions'];

  filteredBookings = computed(() => {
    const filter = this.statusFilter();
    const bookings = this.allBookings();

    if (filter === 'all') return bookings;
    return bookings.filter(b => b.status === filter);
  });

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading.set(true);
    this.bookingService.getAll().subscribe({
      next: (bookings) => {
        const sorted = [...bookings].sort(
          (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        this.allBookings.set(sorted);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onFilterChange(value: StatusFilter): void {
    this.statusFilter.set(value);
  }

  formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  canCancel(booking: Booking): boolean {
    return booking.status === 'Confirmed';
  }

  cancelBooking(booking: Booking): void {
    const confirmed = confirm(`¿Cancelar la reserva de "${booking.userName}" en "${booking.spaceName}"?`);
    if (!confirmed) return;

    this.bookingService.cancel(booking.id).subscribe({
      next: () => this.loadBookings(),
      error: () => alert('No se pudo cancelar la reserva.')
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
