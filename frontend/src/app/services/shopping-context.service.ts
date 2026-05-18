import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShoppingContextService {
  /** Last product the shopper engaged with — carried through checkout (no re-asking). */
  lastProductTitle = new BehaviorSubject<string | null>(null);

  setFromProduct(product: { node?: { title?: string } }): void {
    const title = product?.node?.title;
    if (title) {
      this.lastProductTitle.next(title);
    }
  }

  getContextLabel(): string | null {
    return this.lastProductTitle.value;
  }
}
