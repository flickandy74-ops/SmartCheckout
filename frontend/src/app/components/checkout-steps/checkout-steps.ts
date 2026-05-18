import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutStateService, CheckoutStep } from '../../services/checkout-state.service';

@Component({
  selector: 'app-checkout-steps',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout-steps.html',
  styleUrls: ['./checkout-steps.css']
})
export class CheckoutSteps {
  currentStep: CheckoutStep = 'cart';

  readonly steps: { id: CheckoutStep; label: string }[] = [
    { id: 'cart', label: 'Cart' },
    { id: 'payment', label: 'Payment' },
    { id: 'confirmation', label: 'Confirmation' }
  ];

  constructor(private checkoutState: CheckoutStateService) {
    this.checkoutState.step.subscribe(s => (this.currentStep = s));
  }

  isActive(step: CheckoutStep): boolean {
    return this.currentStep === step;
  }

  isDone(step: CheckoutStep): boolean {
    const order: CheckoutStep[] = ['cart', 'payment', 'confirmation'];
    return order.indexOf(this.currentStep) > order.indexOf(step);
  }
}
