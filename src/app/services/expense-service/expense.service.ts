import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PersonDetailsService } from '../person-details-service/person-details.service';
import { Expense } from '../../model/expense';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  url: string = "http://3.79.98.250"
  //url: string = "http://localhost:8080"

  private addExpenseUrl = this.url + '/api/expense/add';
  private getMonthTotalUrl = this.url + '/api/expense/currentMonthTotal';
  private getExpensesByCategoryUrl = this.url + '/api/expense/byCategory/';

  constructor(private http: HttpClient, private personDetailsService: PersonDetailsService) { }

  addExpense(newExpense: Expense, personId: number): Observable<string> {
    const token = this.personDetailsService.getToken();

    if (!token) {
      const message = 'Token is not available';
      console.log(message);
      return of(message);
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const requestBody = { expense: newExpense, personId };

    return this.http.post(this.addExpenseUrl, requestBody, { headers, responseType: 'text' }).pipe(
      catchError(error => {
        const errorMessage = error.error?.message || 'Error adding expense';
        console.error(errorMessage);
        return of(errorMessage);
      })
    );
  }

  getCurrentMonthTotal(personId: number): Observable<{ total: number }> {
    const token = this.personDetailsService.getToken();

    if (!token) {
      const message = 'Token is not available';
      console.log(message);
      return of({ total: 0 });
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<{ total: number }>(`${this.getMonthTotalUrl}/${personId}`, { headers }).pipe(
      catchError(error => {
        const errorMessage = error.error?.message || 'Current month total expenses equals 0.';
        console.error(errorMessage);
        return of({ total: 0 });
      })
    );
  }

  getExpensesByCategory(category: string, personId: number): Observable<Expense[]> {
    const token = this.personDetailsService.getToken();

    if (!token) {
      const message = 'Token is not available';
      console.log(message);
      return of([]);
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Expense[]>(`${this.getExpensesByCategoryUrl}${category}/${personId}`, { headers }).pipe(
      catchError(error => {
        const errorMessage = error.error?.message || 'Error fetching expenses by category, because expenses equals 0.';
        console.error(errorMessage);
        return of([]);
      })
    );
  }
}
