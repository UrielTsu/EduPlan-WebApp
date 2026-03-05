import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';

type ClassroomStatus = 'Disponible' | 'En uso';

interface Classroom {
  id: number;
  name: string;
  building: string;
  capacity: number;
  status: ClassroomStatus;
  resources: string[];
}

interface ClassroomFormModel {
  building: string;
  name: string;
  capacity: number;
  resources: string[];
  status: ClassroomStatus;
}

@Component({
  selector: 'app-classroom-management',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatCardModule, MatButtonModule, MatTableModule, RouterLink],
  templateUrl: 'aula-admin.html',
  styleUrls: ['aula-admin.scss']
})
export class AulaComponent {
  private readonly classroomsStorageKey = 'edplan.gestion.aulas';

  searchTerm = signal('');
  classrooms = signal<Classroom[]>([
    {
      id: 1,
      name: 'Aula 101',
      building: 'Edificio A',
      capacity: 40,
      status: 'Disponible',
      resources: ['Proyector', 'Pantalla']
    },
    {
      id: 2,
      name: 'Lab 205',
      building: 'Edificio B',
      capacity: 25,
      status: 'En uso',
      resources: ['Equipo Especializado', 'Aire Acondicionado']
    },
    {
      id: 3,
      name: 'Aula 301',
      building: 'Edificio C',
      capacity: 35,
      status: 'Disponible',
      resources: ['Pódium']
    },
  ]);

  showClassroomModal = signal(false);
  editingClassroomId = signal<number | null>(null);
  buildingOptions = ['Edificio A', 'Edificio B', 'Edificio C'];
  resourceOptions: Array<{ name: string; icon: string }> = [
    { name: 'Proyector', icon: 'tv' },
    { name: 'Aire Acondicionado', icon: 'ac_unit' },
    { name: 'Pódium', icon: 'co_present' },
    { name: 'Pantalla', icon: 'desktop_windows' },
    { name: 'Equipo Especializado', icon: 'science' }
  ];
  classroomForm: ClassroomFormModel = {
    building: '',
    name: '',
    capacity: 30,
    resources: [],
    status: 'Disponible'
  };

  constructor() {
    this.loadFromStorage();
    effect(() => this.writeToStorage(this.classrooms()));
  }

  filteredClassrooms = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.classrooms().filter(c =>
      c.name.toLowerCase().includes(term) || c.building.toLowerCase().includes(term)
    );
  });

  totalCapacity = computed(() => this.classrooms().reduce((sum, c) => sum + c.capacity, 0));
  activeCount = computed(() => this.classrooms().filter(c => c.status === 'Disponible').length);

  openCreateClassroomModal(): void {
    this.editingClassroomId.set(null);
    this.classroomForm = {
      building: '',
      name: '',
      capacity: 30,
      resources: [],
      status: 'Disponible'
    };
    this.showClassroomModal.set(true);
  }

  openEditClassroomModal(id: number): void {
    const selectedClassroom = this.classrooms().find((item) => item.id === id);

    if (!selectedClassroom) {
      return;
    }

    this.editingClassroomId.set(id);
    this.classroomForm = {
      building: selectedClassroom.building,
      name: selectedClassroom.name,
      capacity: selectedClassroom.capacity,
      resources: [...selectedClassroom.resources],
      status: selectedClassroom.status
    };
    this.showClassroomModal.set(true);
  }

  closeClassroomModal(): void {
    this.showClassroomModal.set(false);
  }

  decrementCapacity(): void {
    this.classroomForm.capacity = Math.max(1, Number(this.classroomForm.capacity) - 1);
  }

  incrementCapacity(): void {
    this.classroomForm.capacity = Number(this.classroomForm.capacity) + 1;
  }

  toggleResource(resource: string): void {
    const selected = this.classroomForm.resources;
    const index = selected.indexOf(resource);

    if (index >= 0) {
      this.classroomForm.resources = selected.filter((item) => item !== resource);
    } else {
      this.classroomForm.resources = [...selected, resource];
    }
  }

  hasResource(resource: string): boolean {
    return this.classroomForm.resources.includes(resource);
  }

  saveClassroom(): void {
    const building = this.classroomForm.building;
    const name = this.classroomForm.name.trim();
    const capacity = Number(this.classroomForm.capacity);
    const resources = [...this.classroomForm.resources];
    const status = this.classroomForm.status;

    if (!building || !name || !capacity) {
      return;
    }

    const currentId = this.editingClassroomId();

    if (currentId !== null) {
      this.classrooms.update((items) =>
        items.map((item) =>
          item.id === currentId
            ? { ...item, building, name, capacity, resources, status }
            : item
        )
      );
    } else {
      const nextId = this.classrooms().length > 0
        ? Math.max(...this.classrooms().map((item) => item.id)) + 1
        : 1;

      this.classrooms.update((items) => [
        ...items,
        {
          id: nextId,
          building,
          name,
          capacity,
          resources,
          status
        }
      ]);
    }

    this.closeClassroomModal();
  }

  deleteClassroom(id: number): void {
    this.classrooms.update((items) => items.filter((item) => item.id !== id));
  }

  private loadFromStorage(): void {
    if (!this.canUseLocalStorage()) {
      return;
    }

    try {
      const rawValue = localStorage.getItem(this.classroomsStorageKey);

      if (!rawValue) {
        return;
      }

      const parsedValue = JSON.parse(rawValue);

      if (Array.isArray(parsedValue)) {
        this.classrooms.set(parsedValue as Classroom[]);
      }
    } catch {
      return;
    }
  }

  private writeToStorage(value: Classroom[]): void {
    if (!this.canUseLocalStorage()) {
      return;
    }

    localStorage.setItem(this.classroomsStorageKey, JSON.stringify(value));
  }

  private canUseLocalStorage(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }
}
