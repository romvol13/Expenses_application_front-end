import { Injectable } from '@angular/core';
import { Router, CanActivate, CanActivateChild } from '@angular/router';
import { PersonDetailsService } from '../person-details-service/person-details.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthValidationService implements CanActivate, CanActivateChild {

  constructor(
    private router: Router,
    private personDetailsService: PersonDetailsService,
    private jwtHelper: JwtHelperService
  ) {}

  canActivate(): boolean {
    const token = localStorage.getItem('jwtToken');
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }

  canActivateChild(): boolean {
    const personDetails = this.personDetailsService.getPersonDetails();
    if (personDetails && personDetails.role === 'ADMIN') {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
