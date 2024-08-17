import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PersonDetailsService } from '../person-details-service/person-details.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  //url: string = "http://16.171.9.92"
  url: string = "http://localhost:8080"

  private categoriesUrl = this.url + '/api/expense/getAllCategories';

  constructor(private http: HttpClient, private personDetailsService: PersonDetailsService) { }

  getCategories(): Observable<string[]> {
    const token = this.personDetailsService.getToken();

    if (!token) {
      console.log('Token is not available');
      return of([]); // Emit an empty array
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<string[]>(this.categoriesUrl, { headers }).pipe(
      catchError(error => {
        console.error('Error fetching categories:', error);
        return of([]); // Return an empty array on error
      })
    );
  }
}
