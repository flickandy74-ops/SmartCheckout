import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { PaymentMethodId } from '../../services/checkout-state.service';
import { CheckoutInsight } from '../../services/ai.service';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-modal.html',
  styleUrls: ['./payment-modal.css']
})
export class PaymentModal implements OnChanges {
  @Input() open = false;
  @Input() total = 0;
  @Input() insights: CheckoutInsight | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() paid = new EventEmitter<{ method: PaymentMethodId; transactionId: string }>();

  selectedMethod: PaymentMethodId = 'upi';
  processing = false;
  paymentSuccess = false;

  upiId = 'demo@upi';
  cardNumber = '4111 1111 1111 1111';
  cardName = 'Demo User';
  cardExpiry = '12/28';
  cardCvv = '123';

  readonly methods: { id: PaymentMethodId; label: string; icon: string }[] = [
    { id: 'upi', label: 'UPI', icon: '⚡' },
    { id: 'card', label: 'Credit / Debit', icon: '💳' },
    { id: 'wallet', label: 'Wallet', icon: '👛' },
    { id: 'netbanking', label: 'Net Banking', icon: '🏦' }
  ];

  constructor(private paymentService: PaymentService) {}

  ngOnChanges(): void {
    if (this.open) {
      this.processing = false;
      this.paymentSuccess = false;
      this.pickRecommended();
    }
  }

  pickRecommended(): void {
    const p = this.insights?.recommendedPayment?.toLowerCase() ?? '';
    if (p.includes('upi')) this.selectedMethod = 'upi';
    else if (p.includes('card')) this.selectedMethod = 'card';
    else if (p.includes('wallet')) this.selectedMethod = 'wallet';
    else this.selectedMethod = 'upi';
  }

  selectMethod(id: PaymentMethodId): void {
    this.selectedMethod = id;
  }

  close(): void {
    if (!this.processing) this.closed.emit();
  }

  pay(): void {
    if (this.processing) return;
    this.processing = true;

    this.paymentService
      .processPayment({
        method: this.selectedMethod,
        amount: this.total,
        upiId: this.upiId,
        cardNumber: this.cardNumber,
        cardName: this.cardName,
        cardExpiry: this.cardExpiry,
        cardCvv: this.cardCvv
      })
      .subscribe({
        next: res => {
          this.paymentSuccess = true;
          setTimeout(() => {
            this.paid.emit({ method: this.selectedMethod, transactionId: res.transactionId });
            this.processing = false;
            this.paymentSuccess = false;
          }, 1200);
        },
        error: () => {
          this.processing = false;
        }
      });
  }

  isRecommended(id: PaymentMethodId): boolean {
    const p = this.insights?.recommendedPayment?.toLowerCase() ?? '';
    if (id === 'upi') return p.includes('upi');
    if (id === 'card') return p.includes('card') || p.includes('credit');
    return false;
  }
}
