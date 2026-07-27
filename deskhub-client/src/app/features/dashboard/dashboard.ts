import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../core/services/auth.service';
import { OfficeService } from '../../core/services/office.service';
import { SpaceService } from '../../core/services/space.service';
import { BookingService } from '../../core/services/booking.service';
import { Office, Space, Booking } from '../../core/models/dashboard.modules';
import { forkJoin } from 'rxjs';
import { BookingDialog } from './booking-dialog/booking-dialog';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private officeService = inject(OfficeService);
  private spaceService = inject(SpaceService);
  private bookingService = inject(BookingService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  loading = signal(true);
  offices = signal<Office[]>([]);
  spaces = signal<Space[]>([]);
  bookings = signal<Booking[]>([]);
  searchTerm = signal('');

  currentUser = this.authService.currentUser;

  isAdminOrManager = computed(() => {
    const role = this.currentUser()?.roleName;
    return role === 'Admin' || role === 'Manager';
  });

  upcomingBookings = computed(() =>
    this.bookings()
      .filter(b => b.status === 'Confirmed' && new Date(b.startTime) >= new Date())
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 5)
  );

  availableSpaces = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const active = this.spaces().filter(s => s.isActive);

    if (!term) return active.slice(0, 8);

    return active
      .filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.officeName.toLowerCase().includes(term) ||
        s.spaceTypeName.toLowerCase().includes(term)
      )
      .slice(0, 8);
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    forkJoin({
      offices: this.officeService.getAll(),
      spaces: this.spaceService.getAll(),
      bookings: this.bookingService.getAll()
    }).subscribe({
      next: ({ offices, spaces, bookings }) => {
        this.offices.set(offices);
        this.spaces.set(spaces);
        this.bookings.set(bookings);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  openBookingDialog(space: Space): void {
    const dialogRef = this.dialog.open(BookingDialog, {
      data: { space }
    });

    dialogRef.afterClosed().subscribe((created: boolean) => {
      if (created) {
        this.bookingService.getAll().subscribe(bookings => this.bookings.set(bookings));
      }
    });
  }

  goToFloorplan(): void {
    this.router.navigate(['/floorplan']);
  }

  goToOffices(): void {
    this.router.navigate(['/admin/offices']);
  }

  goToSpaces(): void {
    this.router.navigate(['/admin/spaces']);
  }

  goToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  goToBookings(): void {
    this.router.navigate(['/admin/bookings']);
  }

  formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  initialsOf(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase() ?? '')
      .join('');
  }

  logout(): void {
    this.authService.logout();
  }
}
