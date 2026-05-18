import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmedOrder } from '../../services/checkout-state.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-confirmation.html',
  styleUrls: ['./order-confirmation.css']
})
export class OrderConfirmation implements OnChanges, OnDestroy {
  @Input() order: ConfirmedOrder | null = null;
  @Input() visible = false;
  @Output() continueShopping = new EventEmitter<void>();
  isClosing = false;

  ngOnDestroy(): void {
    this.lockBodyScroll(false);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']) {
      if (this.visible) {
        this.isClosing = false;
        this.lockBodyScroll(true);
      } else {
        this.lockBodyScroll(false);
      }
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.visible && !this.isClosing) {
      this.dismiss();
    }
  }

  onOverlayClick(): void {
    if (!this.isClosing) {
      this.dismiss();
    }
  }

  onCloseClick(event: Event): void {
    event.stopPropagation();
    this.dismiss();
  }

  onContinue(): void {
    this.dismiss();
  }

  private dismiss(): void {
    if (this.isClosing) return;
    this.isClosing = true;
    setTimeout(() => {
      this.lockBodyScroll(false);
      this.isClosing = false;
      this.continueShopping.emit();
    }, 280);
  }

  private lockBodyScroll(lock: boolean): void {
    document.body.classList.toggle('confirmation-modal-open', lock);
    document.documentElement.classList.toggle('confirmation-modal-open', lock);
  }
}
