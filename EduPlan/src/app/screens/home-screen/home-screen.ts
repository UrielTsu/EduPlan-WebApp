import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'HomeScreen',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './home-screen.html',
  styleUrls: ['./home-screen.scss']
})
export class HomeScreen {
  // Features data to keep the template clean
  
}
