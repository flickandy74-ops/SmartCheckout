import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopifyService } from '../../services/shopify.service';
import { ChangeDetectorRef } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { ShoppingContextService } from '../../services/shopping-context.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css']
})

export class ProductList implements OnInit {

  products: any[] = [];

  constructor(
    private shopifyService: ShopifyService,
     private cdr: ChangeDetectorRef,
      private cartService: CartService,
      private shoppingContext: ShoppingContextService
  ) {}

  async ngOnInit() {

    await this.loadProducts();

  }

 async loadProducts() {

  try {

    const response = await this.shopifyService.getProducts();

    console.log('Products:', response);

    this.products = response || [];

    this.cdr.detectChanges();

  } catch(error) {

    console.error(error);

  }

}

  addToCart(product: any) {
    this.shoppingContext.setFromProduct(product);
    this.cartService.addToCart(product);
  }

}