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
import { SpaceService } from '../../../core/services/space.service';
import { Space } from '../../../core/models/dashboard.modules';
import { SpaceFormDialog } from './space-form-dialog/space-form-dialog';

@Component({
  selector: 'app-spaces',
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
  templateUrl: './spaces.html',
  styleUrl: './spaces.scss'
})
export class Spaces implements OnInit {
  private spaceService = inject(SpaceService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  loading = signal(true);
  spaces = signal<Space[]>([]);
  displayedColumns = ['name', 'office', 'type', 'capacity', 'status', 'actions'];

  ngOnInit(): void {
    this.loadSpaces();
  }

  loadSpaces(): void {
    this.loading.set(true);
    this.spaceService.getAll().subscribe({
      next: (spaces) => {
        this.spaces.set(spaces);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(SpaceFormDialog, {
      data: { space: null }
    });

    dialogRef.afterClosed().subscribe((saved: boolean) => {
      if (saved) this.loadSpaces();
    });
  }

  openEditDialog(space: Space): void {
    const dialogRef = this.dialog.open(SpaceFormDialog, {
      data: { space }
    });

    dialogRef.afterClosed().subscribe((saved: boolean) => {
      if (saved) this.loadSpaces();
    });
  }

  deleteSpace(space: Space): void {
    const confirmed = confirm(`¿Seguro que quieres eliminar "${space.name}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    this.spaceService.delete(space.id).subscribe({
      next: () => this.loadSpaces(),
      error: () => alert('No se pudo eliminar el espacio. Puede que tenga reservas asociadas.')
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
