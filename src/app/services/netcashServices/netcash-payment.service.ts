import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '../app-config.service';
import { NetcashPaymentRequest } from '../../features/organization/models/netcash/netcash-payment-request';
import { Observable } from 'rxjs';
import { INetcashPaymentResponse } from '../../interfaces/netcash/inetcash-payment-response';

@Injectable({
  providedIn: 'root'
})
export class NetcashPaymentService {
  
  constructor(private http: HttpClient,
              private configService: AppConfigService
  ) { }

  initialPayment(request: NetcashPaymentRequest): void {
    request.m1 = this.configService.netcashServiceKey;
    request.m2 = this.configService.netcashSoftwareVendorKey;

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = this.configService.netcashApiUrl;

    const formData = request.toFormData();

    Object.keys(formData).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = formData[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit
  }

  createPaymentRequest (
    orderRef: string,
    amountInRands: string,
    description: string,
    returnUrl?: string
  ): NetcashPaymentRequest {

    const baseUrl = window.location.origin;

    return new NetcashPaymentRequest({
      m1: this.configService.netcashServiceKey,
      m2: this.configService.netcashSoftwareVendorKey,
      p2: orderRef,
      p3: description,
      p4: NetcashPaymentRequest.convertToCents(parseFloat(amountInRands)),
      m4: returnUrl || `${baseUrl}/payment/success`,
      m5: `${baseUrl}/payement/cancel`,
      m6: `${baseUrl}/payment/error`,
      m7: `${baseUrl}/api/payment/netcash/notify`,
      Budget: 'N'
    });
  }

  addCustomerInfo(
    request: NetcashPaymentRequest,
    name: string,
    email: string,
    phone?: string
  ): void {
    request.m8 = name;
    request.m9 = email;
    request.m10 = phone;
  }

  verifyPayment(reference: string): Observable<INetcashPaymentResponse> {
    const url = `${this.configService.apiUrl}/payment/netcash/verify`;
    const params = new HttpParams().set('reference', reference);

    return this.http.get<INetcashPaymentResponse>(url, { params })
  }

  getPaymentStatus(orderId: string): Observable<INetcashPaymentResponse> {
    const url = `${this.configService.apiUrl}/payment/status/${orderId}`
    return this.http.get<INetcashPaymentResponse>(url);
  }

  generateOrderReference(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `ORD-${timestamp}-${random}`;
  }
}
