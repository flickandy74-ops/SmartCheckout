import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { PaymentMethodId } from './checkout-state.service';

export interface PaymentRequest {
  method: PaymentMethodId;
  amount: number;
  upiId?: string;
  cardNumber?: string;
  cardName?: string;
  cardExpiry?: string;
  cardCvv?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  message: string;
}

/** Mock payment processor for hackathon demo. */
@Injectable({ providedIn: 'root' })
export class PaymentService {
  processPayment(request: PaymentRequest): Observable<PaymentResult> {
    const txn = `TXN-${Date.now().toString(36).toUpperCase()}`;
    return of({
      success: true,
      transactionId: txn,
      message: `Paid ₹${request.amount} via ${request.method.toUpperCase()}`
    }).pipe(delay(1800));
  }

  getMethodLabel(method: PaymentMethodId): string {
    const labels: Record<PaymentMethodId, string> = {
      upi: 'UPI',
      card: 'Credit / Debit Card',
      wallet: 'Wallet',
      netbanking: 'Net Banking'
    };
    return labels[method];
  }
}
