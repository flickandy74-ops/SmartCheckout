import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Product } from '../../models/product';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout {

  products: Product[] = [
    {
      id: 1,
      name: 'MacBook Pro',
      description: '16-inch • Silver',
      price: 120000
    },
    {
      id: 2,
      name: 'Wireless Mouse',
      description: 'Bluetooth',
      price: 2000
    }
  ];

  getTotal(): number {
    return this.products.reduce((total, product) => total + product.price, 0);
  }

}