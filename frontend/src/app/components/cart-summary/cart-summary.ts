import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-summary.html',
  styleUrls: ['./cart-summary.css']
})
export class CartSummary {
  @Input() cartItems: any[] = [];
  @Input() total = 0;
  @Input() savings = 0;
  @Input() compact = true;
  @Output() remove = new EventEmitter<any>();

  removeItem(item: any): void {
    this.remove.emit(item);
  }
}
