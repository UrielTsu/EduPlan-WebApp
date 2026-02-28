import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

interface Classroom {
  id: string;
  name: string;
  building: string;
  capacity: number;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-classroom-management',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatCardModule, MatButtonModule, MatTableModule],
  templateUrl: 'aula-admin.html',
  styleUrls: ['aula-admin.scss']
})
export class AulaComponent {
  searchTerm = signal('');
  classrooms = signal<Classroom[]>([
    { id: '1', name: 'Aula 101', building: 'Edificio A', capacity: 40, status: 'active' },
    { id: '2', name: 'Aula 102', building: 'Edificio A', capacity: 35, status: 'active' },
    { id: '3', name: 'Aula 201', building: 'Edificio A', capacity: 45, status: 'active' },
    { id: '4', name: 'Aula 301', building: 'Edificio B', capacity: 30, status: 'active' },
    { id: '5', name: 'Lab 101', building: 'Edificio B', capacity: 25, status: 'inactive' },
    { id: '6', name: 'Lab 205', building: 'Edificio C', capacity: 20, status: 'active' },
    { id: '7', name: 'Aula 405', building: 'Edificio C', capacity: 50, status: 'active' },
    { id: '8', name: 'Lab 301', building: 'Edificio C', capacity: 22, status: 'active' },
  ]);

  filteredClassrooms = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.classrooms().filter(c =>
      c.name.toLowerCase().includes(term) || c.building.toLowerCase().includes(term)
    );
  });

  totalCapacity = computed(() => this.classrooms().reduce((sum, c) => sum + c.capacity, 0));
  activeCount = computed(() => this.classrooms().filter(c => c.status === 'active').length);
}
