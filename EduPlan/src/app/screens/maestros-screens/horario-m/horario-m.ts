import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

interface ScheduleClass {
  id: string;
  subject: string;
  group: string;
  room: string;
  startTime: string;
  endTime: string;
  color: string;
}

interface DaySchedule {
  day: string;
  date: string;
  classes: ScheduleClass[];
}

@Component({
  selector: 'horario-m',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatCardModule],
  templateUrl: './horario-m.html',
  styleUrls: ['./horario-m.scss']
})
export class TeacherScheduleComponent {
  // Datos basados en las imágenes de EduPlan Profe
  weekSchedule: DaySchedule[] = [
    {
      day: 'Lunes',
      date: '10 Feb',
      classes: [
        { id: '1', subject: 'Estructuras de Datos Avanzadas', group: 'CS302-A', room: 'Aula 301', startTime: '08:00', endTime: '10:00', color: 'purple' },
        { id: '2', subject: 'Programación Orientada a Objetos', group: 'CS301-B', room: 'Lab 102', startTime: '10:00', endTime: '12:00', color: 'blue' },
        { id: '3', subject: 'Algoritmos Avanzados', group: 'CS401-A', room: 'Aula 405', startTime: '14:00', endTime: '16:00', color: 'green' }
      ]
    },
    {
      day: 'Martes',
      date: '11 Feb',
      classes: [
        { id: '4', subject: 'Estructuras de Datos Avanzadas', group: 'CS302-A', room: 'Aula 301', startTime: '08:30', endTime: '10:00', color: 'purple' }
      ]
    },
    {
      day: 'Miércoles',
      date: '12 Feb',
      classes: [
        { id: '6', subject: 'Programación Orientada a Objetos', group: 'CS301-B', room: 'Lab 102', startTime: '10:00', endTime: '12:00', color: 'blue' },
        { id: '7', subject: 'Algoritmos Avanzados', group: 'CS401-A', room: 'Aula 405', startTime: '14:00', endTime: '16:00', color: 'green' }
      ]
    },
    {
      day: 'Jueves',
      date: '13 Feb',
      classes: [
        { id: '8', subject: 'Estructuras de Datos Avanzadas', group: 'CS302-A', room: 'Aula 301', startTime: '08:30', endTime: '10:00', color: 'purple' }
      ]
    },
    {
      day: 'Viernes',
      date: '14 Feb',
      classes: [
        { id: '10', subject: 'Programación Orientada a Objetos', group: 'CS301-B', room: 'Lab 102', startTime: '10:00', endTime: '12:00', color: 'blue' }
      ]
    }
  ];

  timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

  getClassPosition(startTime: string, endTime: string) {
    const startHour = parseInt(startTime.split(':')[0]);
    const startMinute = parseInt(startTime.split(':')[1]);
    const endHour = parseInt(endTime.split(':')[0]);
    const endMinute = parseInt(endTime.split(':')[1]);

    const startPosition = (startHour - 8) * 60 + startMinute;
    const duration = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);

    return {
      'top.px': (startPosition / 60) * 64,
      'height.px': (duration / 60) * 64 - 4
    };
  }
}
