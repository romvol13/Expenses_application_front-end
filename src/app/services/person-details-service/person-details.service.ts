import { Injectable } from '@angular/core';
import { LoggedPerson } from '../../model/logged-person';

@Injectable({
  providedIn: 'root'
})
export class PersonDetailsService {

  private personDetails: LoggedPerson | null = null;

  constructor() {
    this.loadPersonDetails();
  }

  private loadPersonDetails(): void {
    const dataAboutPerson = localStorage.getItem('personDetails');
    this.personDetails = dataAboutPerson ? JSON.parse(dataAboutPerson) : null;
  }

  public savePersonDetailsLocal(details: LoggedPerson): void {
    this.personDetails = details;
    localStorage.setItem('personDetails', JSON.stringify(details));
    if (details.token) {
      localStorage.setItem('jwtToken', details.token);
    }
  }

  public getPersonDetails(): LoggedPerson | null {
    return this.personDetails;
  }

  public getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  public checkIfUserAdmin(): boolean {
    return !!this.personDetails && this.personDetails.role === "ADMIN";
  }

  public clearPersonDetails(): void {
    this.personDetails = null;
    localStorage.removeItem('personDetails');
    localStorage.removeItem('jwtToken');
  }
}
