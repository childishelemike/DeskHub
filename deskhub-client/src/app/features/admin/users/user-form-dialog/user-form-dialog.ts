import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService, UserCreateRequest } from '../../../../core/services/user.service';
import { OfficeService } from '../../../../core/services/office.service';
import { RoleService } from '../../../../core/services/role.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User, Office, Role } from '../../../../core/models/dashboard.modules';

export interface UserFormDialogData {
  user: User | null; // null = creando, con valor = editando
}

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-form-dialog.html',
  styleUrl: './user-form-dialog.scss'
})
export class UserFormDialog implements OnInit {
  private dialogRef = inject(MatDialogRef<UserFormDialog>);
  private userService = inject(UserService);
  private officeService = inject(OfficeService);
  private roleService = inject(RoleService);
  private authService = inject(AuthService);
  data = inject<UserFormDialogData>(MAT_DIALOG_DATA);

  isEditMode = !!this.data.user;

  fullName = this.data.user?.fullName ?? '';
  email = this.data.user?.email ?? '';
  password = '';
  roleId = this.data.user?.roleId ?? null;
  officeId = this.data.user?.officeId ?? null;

  offices = signal<Office[]>([]);
  roles = signal<Role[]>([]);
  loadingOptions = signal(true);
  saving = signal(false);
  errorMessage = signal('');

  private optionsLoaded = { offices: false, roles: false };

  ngOnInit(): void {
    this.officeService.getAll().subscribe(offices => {
      this.offices.set(offices);
      this.optionsLoaded.offices = true;
      this.checkOptionsLoaded();
    });

    this.roleService.getAll().subscribe(roles => {
      this.roles.set(roles);
      if (!this.roleId && roles.length > 0) {
        this.roleId = roles[0].id;
      }
      this.optionsLoaded.roles = true;
      this.checkOptionsLoaded();
    });
  }

  private checkOptionsLoaded(): void {
    if (this.optionsLoaded.offices && this.optionsLoaded.roles) {
      this.loadingOptions.set(false);
    }
  }

  close(): void {
    this.dialogRef.close(false);
  }

  save(): void {
    if (!this.fullName.trim() || !this.email.trim()) {
      this.errorMessage.set('Completa el nombre y el correo.');
      return;
    }

    if (!this.isEditMode && !this.password.trim()) {
      this.errorMessage.set('Escribe una contraseña temporal para el nuevo usuario.');
      return;
    }

    if (!this.roleId) {
      this.errorMessage.set('Selecciona un rol.');
      return;
    }

    const companyId = this.authService.currentUser()?.companyId;
    if (!companyId) {
      this.errorMessage.set('No se pudo determinar la empresa actual.');
      return;
    }

    const payload: UserCreateRequest = {
      fullName: this.fullName.trim(),
      email: this.email.trim(),
      password: this.password.trim(),
      roleId: this.roleId,
      companyId,
      officeId: this.officeId
    };

    this.saving.set(true);
    this.errorMessage.set('');

    const onSuccess = () => {
      this.saving.set(false);
      this.dialogRef.close(true);
    };

    const onError = (err: unknown) => {
      this.saving.set(false);
      const httpError = err as { error?: unknown };
      this.errorMessage.set(
        typeof httpError.error === 'string' ? httpError.error : 'No se pudo guardar el usuario.'
      );
    };

    if (this.isEditMode) {
      this.userService.update(this.data.user!.id, payload).subscribe({
        next: onSuccess,
        error: onError
      });
    } else {
      this.userService.create(payload).subscribe({
        next: onSuccess,
        error: onError
      });
    }
  }
}
