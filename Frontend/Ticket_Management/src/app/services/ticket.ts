import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Ticket {
  private apiUrl = 'http://localhost:5000/api/tickets';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders(
      token ? { Authorization: `Bearer ${token}` } : {}
    );
  }

  createTicket(data: {
    title: string;
    description: string;
    category: string;
    email?: string;
    department: string;
    location: string;
  }): Observable<any> {
    return this.http.post(this.apiUrl, data, {
      headers: this.getHeaders()
    });
  }

  getRecentTickets(): Observable<any> {
    return this.http.get(`${this.apiUrl}/recent`, {
      headers: this.getHeaders()
    });
  }

  // Fetch only the logged-in user's tickets
  getMyTickets(): Observable<any> {
  return this.http.get(`${this.apiUrl}/my`, {
    headers: this.getHeaders()
  });
}

  getTicketById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  updateTicket(
    id: string,
    data: {
      title: string;
      description: string;
      category: string;
      priority: string;
      status: string;
    }
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, {
      headers: this.getHeaders()
    });
  }
}
