import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface CheckoutInsight {
  savings: number;
  recommendedPayment: string;
  estimatedDelivery: string;
  aiScore: number;
  recommendation: string;
  message: string;
  feeExplanation: string;
  deliveryTradeoff: string;
  paymentTradeoff: string;
}

export interface CompleteCheckoutResponse {
  orderId: string;
  cartTotal: number;
  itemCount: number;
  status: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCheckoutInsights(cartTotal: number, productContext?: string | null) {
    let params = new HttpParams();
    if (productContext) {
      params = params.set('context', productContext);
    }
    return this.http.get<CheckoutInsight>(
      `${this.apiUrl}/checkout/analyze/${cartTotal}`,
      { params }
    );
  }

  completeCheckout(
    cartTotal: number,
    itemCount: number,
    lastProductContext?: string | null
  ) {
    return this.http.post<CompleteCheckoutResponse>(
      `${this.apiUrl}/checkout/complete`,
      {
        cartTotal,
        itemCount,
        lastProductContext: lastProductContext ?? undefined
      }
    );
  }
}
