import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NetcashPaymentService } from '../../services/netcashServices/netcash-payment.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-netcash-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './netcash-payment.component.html',
  styleUrls: ['./netcash-payment.component.css']
})

export class NetcashPaymentComponent implements OnInit {
  amount: number = 0;
  description: string = '';
  orderReference: string = '';

  customerName: string = '';
  customerEmail: string = '';
  customerPhone: string = '';

  isProcessing: boolean = false;
  showCustomerForm: boolean = true;

  constructor(
    private netcashService: NetcashPaymentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['amount']) {
        this.amount = parseFloat(params['amount']);
      }
      if (params['description']) {
        this.description = params['description'];
      }
      if (params['orderRef']) {
        this.orderReference = params['orderRef'];
      }
      else {
        this.orderReference = this.netcashService.generateOrderReference();
      }
    });
  }

  isFormValid(): boolean {
    return this.amount > 0 &&
           this.description.trim() !== '' &&
           this.customerName.trim() !== '' &&
           this.customerEmail.trim() !== '' &&
           this.isValidEmail(this.customerEmail);
  }

  isValidEmail(customerEmail: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(customerEmail);
  }

  processPayment(): void {
    if (!this.isFormValid()) {
      alert('please fill all required field correctly.');
      return;
    }

    this.isProcessing = true;
    
    try {
      const paymentRequest = this.netcashService.createPaymentRequest(
        this.orderReference,
        this.amount.toString(),
        this.description
      );

      this.netcashService.addCustomerInfo(
        paymentRequest,
        this.customerName,
        this.customerEmail,
        this.customerPhone
      )

      sessionStorage.setItem('lastOrderReference', this.orderReference)
      sessionStorage.setItem('lastPaymentAmount', this.amount.toString())
      console.log('Payment request created', paymentRequest);
    } catch (error) {
      console.error(error);
      alert('An error occurred while creating the payment request.');
    } finally {
      this.isProcessing = false;
    }
  }

  cancelPayment(): void {
    if (confirm('Are you sure you want to cancel this payment?')) {
      this.router.navigate(['/']);
    }
  }

  get formattedAmount(): string {
    return `R ${this.amount.toFixed(2)}`
  }
}