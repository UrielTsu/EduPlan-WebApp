import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

interface ScheduleClass {
  id: string;
  subject: string;
  teacher: string;
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
  selector: 'HorarioA',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatCardModule],
  templateUrl: './horario-a-screen.html',
  styleUrls: ['./horario-a-screen.scss']
})
export class HorarioA {
  selectedView = signal<'week' | 'list'>('week');

  weekSchedule: DaySchedule[] = [
    {
      day: 'Lunes',
      date: '10 Feb',
      classes: [
        { id: '1', subject: 'Álgebra Lineal', teacher: 'Prof. Roberto Silva', room: 'Aula 405', startTime: '08:00', endTime: '10:00', color: 'purple' },
        { id: '2', subject: 'Programación Web', teacher: 'Prof. Ana Martínez', room: 'Aula 102', startTime: '10:30', endTime: '12:30', color: 'green' },
        { id: '3', subject: 'Química Orgánica', teacher: 'Prof. Laura Pérez', room: 'Lab 301', startTime: '14:00', endTime: '16:00', color: 'orange' }
      ]
    },
    // ... datos previos ...
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
