import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PersonDetailsService } from '../services/person-details-service/person-details.service';
import { LoggedPerson } from '../model/logged-person';
import { PersonRequest } from '../model/person-request';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent {

  email: string = "";
  password: string = "";
  tokenStringValue: string = "";
  successMessage: string | null = null;
  errorMessage: string | null = null;
  url: string = "http://16.171.9.92"
  //url: string = "http://localhost:8080"

  personInfo: LoggedPerson = {} as LoggedPerson;

  constructor(private http: HttpClient, private personDetailsService: PersonDetailsService, private router: Router) { }

  public login() {
    this.getAuthTokenFromBackend().subscribe({
      next: (response: any) => {
        this.tokenStringValue = response.token;
        this.personInfo = response.person;
        this.personInfo.token = this.tokenStringValue;
        this.personDetailsService.savePersonDetailsLocal(this.personInfo);
        localStorage.setItem('jwtToken', this.tokenStringValue);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error("Login failed", error);
        this.handleError();
      }
    });
  }

  public getAuthTokenFromBackend(): Observable<any> {
    const encryptedLoginAndPass = btoa(this.email + ":" + this.password);
    const headers = new HttpHeaders().set("Authorization", 'Basic ' + encryptedLoginAndPass);
    const requestBody: PersonRequest = { email: this.email, password: this.password };
    return this.http.post<any>(this.url + "/api/auth/authenticate", requestBody, { headers, responseType: 'json' });
  }

  handleError(): void {
    this.errorMessage = 'Login failed. Please check your credentials and try again.';
    this.successMessage = null;
  }
}
