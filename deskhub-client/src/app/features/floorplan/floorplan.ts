import { Component, OnInit, signal, computed, inject, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { OfficeService } from '../../core/services/office.service';
import { SpaceService } from '../../core/services/space.service';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { Office, Space, Booking } from '../../core/models/dashboard.modules';
import { BookingDialog } from '../dashboard/booking-dialog/booking-dialog';

type SpaceStatus = 'available' | 'occupied' | 'reserved' | 'inactive';

interface SpaceWithStatus extends Space {
  status: SpaceStatus;
  initials: string;
}

interface SeatCell {
  space: SpaceWithStatus | null;
  col: number;
}

interface SeatRow {
  letter: string;
  cells: SeatCell[];
}

const COLUMNS_PER_ROW = 8;

@Component({
  selector: 'app-floorplan',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './floorplan.html',
  styleUrl: './floorplan.scss'
})
export class Floorplan implements OnInit {
  private officeService = inject(OfficeService);
  private spaceService = inject(SpaceService);
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  loading = signal(true);
  offices = signal<Office[]>([]);
  allSpaces = signal<Space[]>([]);
  bookings = signal<Booking[]>([]);
  selectedOfficeId = signal<number | null>(null);

  currentUser = this.authService.currentUser;

  private isMeeting = (typeName: string) =>
    typeName.toLowerCase().includes('reunion') || typeName.toLowerCase().includes('reunión');

  spacesForSelectedOffice = computed<SpaceWithStatus[]>(() => {
    const officeId = this.selectedOfficeId();
    if (officeId === null) return [];

    const now = new Date();

    return this.allSpaces()
      .filter(s => s.officeId === officeId)
      .map(space => {
        if (!space.isActive) {
          return { ...space, status: 'inactive' as SpaceStatus, initials: this.getInitials(space.name) };
        }

        const spaceBookings = this.bookings().filter(
          b => b.spaceId === space.id && b.status === 'Confirmed'
        );

        const isOccupiedNow = spaceBookings.some(
          b => new Date(b.startTime) <= now && new Date(b.endTime) > now
        );

        const hasUpcomingBooking = spaceBookings.some(
          b => new Date(b.startTime) > now
        );

        let status: SpaceStatus = 'available';
        if (isOccupiedNow) status = 'occupied';
        else if (hasUpcomingBooking) status = 'reserved';

        return { ...space, status, initials: this.getInitials(space.name) };
      })
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  });

  desks = computed(() => this.spacesForSelectedOffice().filter(s => !this.isMeeting(s.spaceTypeName)));
  meetingRooms = computed(() => this.spacesForSelectedOffice().filter(s => this.isMeeting(s.spaceTypeName)));

  columnNumbers = computed(() =>
    Array.from({ length: COLUMNS_PER_ROW }, (_, i) => i + 1)
  );

  seatRows = computed<SeatRow[]>(() => {
    const desks = this.desks();
    const rows: SeatRow[] = [];
    let cursor = 0;
    let rowIndex = 0;

    while (cursor < desks.length) {
      const letter = this.getRowLetter(rowIndex);
      const cells: SeatCell[] = [];

      for (let col = 0; col < COLUMNS_PER_ROW; col++) {
        const space = desks[cursor] ?? null;
        cells.push({ space, col: col + 1 });
        if (space) cursor++;
      }

      rows.push({ letter, cells });
      rowIndex++;
    }

    return rows;
  });

  totalAvailable = computed(() =>
    this.spacesForSelectedOffice().filter(s => s.status === 'available').length
  );

  totalSpaces = computed(() => this.spacesForSelectedOffice().length);

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
        this.allSpaces.set(spaces);
        this.bookings.set(bookings);
        if (offices.length > 0 && this.selectedOfficeId() === null) {
          this.selectedOfficeId.set(offices[0].id);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onOfficeChange(officeId: number): void {
    this.selectedOfficeId.set(officeId);
  }

  openBookingDialog(space: SpaceWithStatus | null): void {
    if (!space || space.status !== 'available') return;

    const dialogRef = this.dialog.open(BookingDialog, {
      data: { space }
    });

    dialogRef.afterClosed().subscribe((created: boolean) => {
      if (created) {
        this.bookingService.getAll().subscribe(bookings => this.bookings.set(bookings));
      }
    });
  }

  seatTooltip(space: SpaceWithStatus): string {
    const labels: Record<SpaceStatus, string> = {
      available: 'Disponible',
      occupied: 'Ocupado ahora',
      reserved: 'Reservado',
      inactive: 'Inactivo'
    };
    return `${space.name} · ${labels[space.status]}`;
  }

  scrollLeft(): void {
    this.scrollContainer()?.nativeElement.scrollBy({ left: -280, behavior: 'smooth' });
  }

  scrollRight(): void {
    this.scrollContainer()?.nativeElement.scrollBy({ left: 280, behavior: 'smooth' });
  }

  private getRowLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  private getInitials(name: string): string {
    const match = name.match(/([A-Za-z]+-?\d+)$/);
    if (match) return match[0].slice(-3).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
