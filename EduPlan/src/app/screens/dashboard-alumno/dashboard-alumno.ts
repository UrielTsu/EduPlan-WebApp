import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

interface Subject {
  id: string;
  name: string;
  time: string;
  room: string;
  teacher: string;
}

interface ScheduleItem {
  time: string;
  subject: string;
  room: string;
}

@Component({
  selector: 'app-dashboard-alumno',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatCardModule],
  templateUrl: './dashboard-alumno.html',
  styleUrls: ['./dashboard-alumno.scss']
})
export class DashboardAlumno {
  selectedDay: number = 2; // Miércoles

  currentClass = {
    subject: 'Cálculo Diferencial',
    room: 'Aula 301',
    teacher: 'Prof. María González',
    time: '10:00 - 12:00'
  };

  weekDays = [
    { id: 0, name: 'Lun', date: '10' },
    { id: 1, name: 'Mar', date: '11' },
    { id: 2, name: 'Mie', date: '12' },
    { id: 3, name: 'Jue', date: '13' },
    { id: 4, name: 'Vie', date: '14' },
  ];

  upcomingSubjects: Subject[] = [
    {
      id: '1',
      name: 'Física II',
      time: '14:00 - 16:00',
      room: 'Lab 205',
      teacher: 'Prof. Carlos Ruiz'
    },
    {
      id: '2',
      name: 'Programación Web',
      time: '16:30 - 18:30',
      room: 'Aula 102',
      teacher: 'Prof. Ana Martínez'
    },
    {
      id: '3',
      name: 'Álgebra Lineal',
      time: 'Mañana 08:00',
      room: 'Aula 405',
      teacher: 'Prof. Roberto Silva'
    },
    {
      id: '4',
      name: 'Química Orgánica',
      time: 'Viernes 10:00',
      room: 'Lab 301',
      teacher: 'Prof. Laura Pérez'
    }
  ];

  scheduleByDay: Record<number, ScheduleItem[]> = {
    2: [ // Miércoles
      { time: '08:00', subject: 'Laboratorio de Química', room: 'Lab 301' },
      { time: '10:00', subject: 'Cálculo Diferencial', room: 'Aula 301' },
      { time: '14:00', subject: 'Física II', room: 'Lab 205' },
      { time: '16:30', subject: 'Programación Web', room: 'Aula 102' },
    ]
  };

  selectDay(id: number): void {
    this.selectedDay = id;
  }

  get currentDaySchedule(): ScheduleItem[] {
    return this.scheduleByDay[this.selectedDay] || [];
  }
}
