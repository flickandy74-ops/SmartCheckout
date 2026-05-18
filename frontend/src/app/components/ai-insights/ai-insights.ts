import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutInsight } from '../../services/ai.service';
import { formatInsightChips, pickSmartInsightLine } from './ai-insight-copy';

@Component({
  selector: 'app-ai-insights',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-insights.html',
  styleUrls: ['./ai-insights.css']
})
export class AiInsights {
  @Input() insights: CheckoutInsight | null = null;
  @Input() cartTotal = 0;
  @Input() itemCount = 0;

  get smartInsightLine(): string {
    if (!this.insights) return '';
    return pickSmartInsightLine(this.insights, this.cartTotal, this.itemCount);
  }

  get chips() {
    if (!this.insights) {
      return { savings: null, payment: '', delivery: '', score: '' };
    }
    return formatInsightChips(this.insights);
  }
}
