import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type CheckoutStep = 'cart' | 'payment' | 'confirmation';
export type PaymentMethodId = 'upi' | 'card' | 'wallet' | 'netbanking';

export interface ConfirmedOrder {
  orderId: string;
  total: number;
  savings: number;
  delivery: string;
  paymentMethod: PaymentMethodId;
  paymentLabel: string;
  aiSummary: string;
  recommendation: string;
  itemCount: number;
}

@Injectable({ providedIn: 'root' })
export class CheckoutStateService {
  readonly step = new BehaviorSubject<CheckoutStep>('cart');
  readonly paymentModalOpen = new BehaviorSubject<boolean>(false);
  readonly confirmedOrder = new BehaviorSubject<ConfirmedOrder | null>(null);

  setStep(step: CheckoutStep): void {
    this.step.next(step);
  }

  openPaymentModal(): void {
    this.paymentModalOpen.next(true);
    this.setStep('payment');
  }

  closePaymentModal(): void {
    this.paymentModalOpen.next(false);
    if (this.step.value === 'payment') {
      this.setStep('cart');
    }
  }

  completeOrder(order: ConfirmedOrder): void {
    this.confirmedOrder.next(order);
    this.paymentModalOpen.next(false);
    this.setStep('confirmation');
  }

  resetCheckout(): void {
    this.confirmedOrder.next(null);
    this.paymentModalOpen.next(false);
    this.setStep('cart');
  }
}
