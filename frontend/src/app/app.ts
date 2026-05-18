import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ProductList } from './components/product-list/product-list';
import { Cart } from './components/cart/cart';
import { OrderConfirmation } from './components/order-confirmation/order-confirmation';
import { CheckoutStateService, ConfirmedOrder } from './services/checkout-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ProductList, Cart, OrderConfirmation],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit, OnDestroy {
  showConfirmation = false;
  confirmedOrder: ConfirmedOrder | null = null;

  private orderSub?: Subscription;

  constructor(
    private checkoutState: CheckoutStateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.orderSub = this.checkoutState.confirmedOrder.subscribe(order => {
      this.confirmedOrder = order;
      this.showConfirmation = !!order;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.orderSub?.unsubscribe();
  }

  onContinueShopping(): void {
    this.checkoutState.resetCheckout();
  }
}
