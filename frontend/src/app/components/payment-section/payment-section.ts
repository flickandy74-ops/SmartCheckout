import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutInsight } from '../../services/ai.service';
import { PaymentMethodId } from '../../services/checkout-state.service';

@Component({
  selector: 'app-payment-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-section.html',
  styleUrls: ['./payment-section.css']
})
export class PaymentSection {
  @Input() insights: CheckoutInsight | null = null;
  @Input() total = 0;

  readonly methods: {
    id: PaymentMethodId;
    label: string;
    icon: string;
    cashback?: string;
    recommended?: boolean;
  }[] = [
    { id: 'upi', label: 'UPI', icon: '⚡', cashback: '2% cashback', recommended: true },
    { id: 'card', label: 'Card', icon: '💳' },
    { id: 'wallet', label: 'Wallet', icon: '👛' },
    { id: 'netbanking', label: 'Net Banking', icon: '🏦' }
  ];

  get recommendedId(): PaymentMethodId {
    const p = this.insights?.recommendedPayment?.toLowerCase() ?? '';
    if (p.includes('upi')) return 'upi';
    if (p.includes('card') || p.includes('credit')) return 'card';
    if (p.includes('wallet')) return 'wallet';
    return 'upi';
  }

  isRecommended(id: PaymentMethodId): boolean {
    return id === this.recommendedId;
  }
}
