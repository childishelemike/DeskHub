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
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/dashboard.modules';
import { UserFormDialog } from './user-form-dialog/user-form-dialog';

@Component({
  selector: 'app-users',
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
  templateUrl: './users.html',
  styleUrl: './users.scss'
})
export class Users implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  loading = signal(true);
  users = signal<User[]>([]);
  displayedColumns = ['name', 'email', 'role', 'office', 'actions'];

  currentUserId = this.authService.currentUser()?.userId;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getAll().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(UserFormDialog, {
      data: { user: null }
    });

    dialogRef.afterClosed().subscribe((saved: boolean) => {
      if (saved) this.loadUsers();
    });
  }

  openEditDialog(user: User): void {
    const dialogRef = this.dialog.open(UserFormDialog, {
      data: { user }
    });

    dialogRef.afterClosed().subscribe((saved: boolean) => {
      if (saved) this.loadUsers();
    });
  }

  deleteUser(user: User): void {
    if (user.id === this.currentUserId) {
      alert('No puedes eliminar tu propio usuario.');
      return;
    }

    const confirmed = confirm(`¿Seguro que quieres eliminar a "${user.fullName}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    this.userService.delete(user.id).subscribe({
      next: () => this.loadUsers(),
      error: () => alert('No se pudo eliminar el usuario. Puede que tenga reservas asociadas.')
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
