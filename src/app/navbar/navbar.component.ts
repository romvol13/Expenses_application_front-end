import { Component, OnInit } from '@angular/core';
import { PersonDetailsService } from '../services/person-details-service/person-details.service';
import { LoggedPerson } from '../model/logged-person';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  loggedPerson: LoggedPerson | null = null;

  constructor(private personDetailsService: PersonDetailsService, private router: Router) {}

  ngOnInit(): void {
    this.loggedPerson = this.personDetailsService.getPersonDetails();
  }

  logOff(): void {
    this.personDetailsService.clearPersonDetails();
    this.router.navigate(['/login']);
  }
}
