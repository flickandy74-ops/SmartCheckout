import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartItems = new BehaviorSubject<any[]>([]);

  addToCart(product: any): void {
    this.cartItems.next([...this.cartItems.value, product]);
  }

  clearCart(): void {
    this.cartItems.next([]);
  }
}
