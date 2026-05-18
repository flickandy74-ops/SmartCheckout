import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkout-comparison',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout-comparison.html',
  styleUrls: ['./checkout-comparison.css']
})
export class CheckoutComparison {
  @Input() savings = 0;
  @Input() aiScore = 0;
}
