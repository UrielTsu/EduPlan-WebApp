import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'HomeScreen',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home-screen.html',
  styleUrls: ['./home-screen.scss']
})
export class HomeScreen {
  // Features data to keep the template clean
  
}
