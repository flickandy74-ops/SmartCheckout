import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { AiService, CheckoutInsight } from '../../services/ai.service';
import { ShoppingContextService } from '../../services/shopping-context.service';
import {
  CheckoutStateService,
  ConfirmedOrder,
  PaymentMethodId
} from '../../services/checkout-state.service';
import { PaymentService } from '../../services/payment.service';
import { Subject, Subscription, switchMap, of, debounceTime, map, catchError } from 'rxjs';
import { AiCopilotChat } from '../ai-copilot-chat/ai-copilot-chat';
import { CheckoutSteps } from '../checkout-steps/checkout-steps';
import { CartSummary } from '../cart-summary/cart-summary';
import { CheckoutComparison } from '../checkout-comparison/checkout-comparison';
import { AiInsights } from '../ai-insights/ai-insights';
import { PaymentModal } from '../payment-modal/payment-modal';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    AiCopilotChat,
    CheckoutSteps,
    CartSummary,
    AiInsights,
    CheckoutComparison,
    PaymentModal
  ],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class Cart implements OnInit, OnDestroy {
  cartItems: any[] = [];
  insights: CheckoutInsight | null = null;
  checkoutError: string | null = null;
  insightsLoading = false;
  showToast = false;
  contextLabel: string | null = null;

  paymentModalOpen = false;
  askAiModalOpen = false;
  showConfirmation = false;
  confirmedOrder: ConfirmedOrder | null = null;

  private cartSub!: Subscription;
  private contextSub!: Subscription;
  private insightsSub!: Subscription;
  private modalSub!: Subscription;
  private insightsTrigger$ = new Subject<number>();
  private previousItemCount = 0;

  constructor(
    public cartService: CartService,
    private aiService: AiService,
    private shoppingContext: ShoppingContextService,
    private checkoutState: CheckoutStateService,
    private paymentService: PaymentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.modalSub = this.checkoutState.paymentModalOpen.subscribe(open => {
      this.paymentModalOpen = open;
      this.syncModalBodyClass();
      this.cdr.markForCheck();
    });

    this.checkoutState.confirmedOrder.subscribe(order => {
      this.confirmedOrder = order;
      this.showConfirmation = !!order;
      this.cdr.markForCheck();
    });

    this.contextSub = this.shoppingContext.lastProductTitle.subscribe(title => {
      this.contextLabel = title;
      this.cdr.markForCheck();
    });

    this.insightsSub = this.insightsTrigger$.pipe(
      debounceTime(150),
      switchMap(cartTotal => {
        if (!cartTotal || cartTotal <= 0) {
          return of({ cartTotal: 0, insights: null as CheckoutInsight | null });
        }
        return this.aiService
          .getCheckoutInsights(cartTotal, this.shoppingContext.getContextLabel())
          .pipe(
            map(insights => ({ cartTotal, insights })),
            catchError(err => {
              console.error('AI insights error:', err);
              return of({ cartTotal, insights: null });
            })
          );
      })
    ).subscribe(({ cartTotal, insights }) => {
      if (cartTotal !== this.computeTotal(this.cartItems)) return;
      this.insights = insights;
      this.insightsLoading = false;
      this.cdr.markForCheck();
    });

    this.cartSub = this.cartService.cartItems.subscribe(items => {
      const prevCount = this.previousItemCount;
      this.previousItemCount = items.length;
      this.cartItems = items;

      if (items.length === 0) {
        this.insightsLoading = false;
        if (!this.showConfirmation) this.insights = null;
        this.cdr.markForCheck();
        return;
      }

      if (this.showConfirmation) {
        this.onContinueShopping();
      }

      const cartTotal = this.computeTotal(items);
      this.insights = null;
      this.insightsLoading = true;
      this.insightsTrigger$.next(cartTotal);

      if (items.length > prevCount) this.showAddedMessage();
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
    this.contextSub?.unsubscribe();
    this.insightsSub?.unsubscribe();
    this.modalSub?.unsubscribe();
    this.insightsTrigger$.complete();
    document.body.classList.remove('app-modal-open');
    document.documentElement.classList.remove('app-modal-open');
  }

  removeItem(item: any): void {
    const index = this.cartItems.indexOf(item);
    if (index === -1) return;
    this.cartService.cartItems.next([
      ...this.cartItems.slice(0, index),
      ...this.cartItems.slice(index + 1)
    ]);
  }

  computeTotal(items: any[]): number {
    return Number(
      items
        .reduce(
          (t, item) =>
            t + Number(item.node?.variants?.edges[0]?.node?.price?.amount || 0),
          0
        )
        .toFixed(2)
    );
  }

  getTotalPrice(): number {
    return this.computeTotal(this.cartItems);
  }

  openAskAi(): void {
    if (this.cartItems.length === 0) return;
    this.askAiModalOpen = true;
    this.syncModalBodyClass();
    this.cdr.markForCheck();
  }

  closeAskAi(): void {
    this.askAiModalOpen = false;
    this.syncModalBodyClass();
    this.cdr.markForCheck();
  }

  private syncModalBodyClass(): void {
    const open = this.askAiModalOpen || this.paymentModalOpen;
    document.body.classList.toggle('app-modal-open', open);
    document.documentElement.classList.toggle('app-modal-open', open);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.askAiModalOpen) this.closeAskAi();
  }

  openPayment(): void {
    if (this.cartItems.length === 0) {
      this.checkoutError = 'Add items to your cart before checkout.';
      return;
    }
    this.checkoutError = null;
    this.checkoutState.openPaymentModal();
  }

  onPaymentModalClose(): void {
    this.checkoutState.closePaymentModal();
  }

  onPaymentComplete(event: { method: PaymentMethodId; transactionId: string }): void {
    const total = this.getTotalPrice();
    const itemCount = this.cartItems.length;
    const paymentLabel = this.paymentService.getMethodLabel(event.method);

    const aiSummary = this.buildAiSummary(event.method, paymentLabel);

    this.aiService
      .completeCheckout(total, itemCount, this.shoppingContext.getContextLabel())
      .subscribe({
        next: res => {
          const order: ConfirmedOrder = {
            orderId: res.orderId,
            total,
            savings: this.insights?.savings ?? 0,
            delivery: this.insights?.estimatedDelivery ?? 'Friday',
            paymentMethod: event.method,
            paymentLabel,
            aiSummary,
            recommendation: this.insights?.recommendation ?? 'Order confirmed.',
            itemCount
          };
          this.cartService.clearCart();
          this.checkoutState.completeOrder(order);
          this.cdr.markForCheck();
        },
        error: () => {
          this.checkoutError =
            'Order confirmation failed. Ensure backend is running on port 5009.';
          this.checkoutState.closePaymentModal();
          this.cdr.markForCheck();
        }
      });
  }

  private buildAiSummary(method: PaymentMethodId, paymentLabel: string): string {
    const savings = this.insights?.savings ?? 0;
    const delivery = this.insights?.estimatedDelivery ?? 'standard delivery';
    return `AI optimized your checkout using ${paymentLabel} and bundle savings of ₹${savings}. Delivery was auto-selected for ${delivery.toLowerCase().includes('tomorrow') ? 'fastest arrival' : 'reliable arrival'} (${delivery}).`;
  }

  onContinueShopping(): void {
    this.checkoutState.resetCheckout();
    this.checkoutError = null;
    this.cdr.markForCheck();
  }

  showAddedMessage(): void {
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
      this.cdr.markForCheck();
    }, 2000);
  }
}
