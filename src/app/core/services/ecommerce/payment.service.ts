import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, Subject } from 'rxjs';

import { environment } from '../../../../environments/environments.prod';

@Injectable({providedIn: 'root'})
export class PaymentService {
  private baseUrl = environment.baseUrl + '/payment-service/api/v1/stripe';

  // Add refresh subject
  private refreshSource = new Subject<void>();

  // Create an observable that components can subscribe to
  refresh$ = this.refreshSource.asObservable();

  constructor(private http: HttpClient) { }
  getConfigStripe(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/config`).pipe(
      map(response => response.data)
    );
  }
  createPaymentIntent(data: { amount: number; description: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/create-payment-intent`, data).pipe(
      map(response => response.data)
    );
  }
}
