import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SpaceService, SpaceCreateRequest } from '../../../../core/services/space.service';
import { OfficeService } from '../../../../core/services/office.service';
import { SpaceTypeService } from '../../../../core/services/space-type.service';
import { Space, Office, SpaceType } from '../../../../core/models/dashboard.modules';

export interface SpaceFormDialogData {
  space: Space | null; // null = creando, con valor = editando
}

@Component({
  selector: 'app-space-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './space-form-dialog.html',
  styleUrl: './space-form-dialog.scss'
})
export class SpaceFormDialog implements OnInit {
  private dialogRef = inject(MatDialogRef<SpaceFormDialog>);
  private spaceService = inject(SpaceService);
  private officeService = inject(OfficeService);
  private spaceTypeService = inject(SpaceTypeService);
  data = inject<SpaceFormDialogData>(MAT_DIALOG_DATA);

  isEditMode = !!this.data.space;

  name = this.data.space?.name ?? '';
  capacity = this.data.space?.capacity ?? 1;
  isActive = this.data.space?.isActive ?? true;
  officeId = this.data.space?.officeId ?? null;
  spaceTypeId = this.data.space?.spaceTypeId ?? null;

  offices = signal<Office[]>([]);
  spaceTypes = signal<SpaceType[]>([]);
  loadingOptions = signal(true);
  saving = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    this.officeService.getAll().subscribe(offices => {
      this.offices.set(offices);
      if (!this.officeId && offices.length > 0) {
        this.officeId = offices[0].id;
      }
      this.checkOptionsLoaded();
    });

    this.spaceTypeService.getAll().subscribe(types => {
      this.spaceTypes.set(types);
      if (!this.spaceTypeId && types.length > 0) {
        this.spaceTypeId = types[0].id;
      }
      this.checkOptionsLoaded();
    });
  }

  private checkOptionsLoaded(): void {
    if (this.offices().length > 0 && this.spaceTypes().length > 0) {
      this.loadingOptions.set(false);
    }
  }

  close(): void {
    this.dialogRef.close(false);
  }

  save(): void {
    if (!this.name.trim()) {
      this.errorMessage.set('Escribe un nombre para el espacio.');
      return;
    }

    if (this.capacity < 1) {
      this.errorMessage.set('La capacidad debe ser al menos 1.');
      return;
    }

    if (!this.officeId || !this.spaceTypeId) {
      this.errorMessage.set('Selecciona una oficina y un tipo de espacio.');
      return;
    }

    const payload: SpaceCreateRequest = {
      name: this.name.trim(),
      capacity: this.capacity,
      isActive: this.isActive,
      positionX: this.data.space?.positionX ?? 0,
      positionY: this.data.space?.positionY ?? 0,
      officeId: this.officeId,
      spaceTypeId: this.spaceTypeId
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
        typeof httpError.error === 'string' ? httpError.error : 'No se pudo guardar el espacio.'
      );
    };

    if (this.isEditMode) {
      this.spaceService.update(this.data.space!.id, payload).subscribe({
        next: onSuccess,
        error: onError
      });
    } else {
      this.spaceService.create(payload).subscribe({
        next: onSuccess,
        error: onError
      });
    }
  }
}
