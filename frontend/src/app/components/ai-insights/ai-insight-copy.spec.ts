import { pickSmartInsightLine, formatInsightChips } from './ai-insight-copy';
import { CheckoutInsight } from '../../services/ai.service';

const baseInsight: CheckoutInsight = {
  savings: 482,
  recommendedPayment: 'UPI Cashback',
  estimatedDelivery: 'Tomorrow (Express)',
  aiScore: 90,
  recommendation: '',
  message: '',
  feeExplanation: '',
  deliveryTradeoff: '',
  paymentTradeoff: ''
};

describe('ai-insight-copy', () => {
  it('formats friendly chip labels', () => {
    const chips = formatInsightChips(baseInsight);
    expect(chips.payment).toBe('UPI Cashback');
    expect(chips.delivery).toBe('Tomorrow Delivery');
    expect(chips.score).toBe('90% Score');
    expect(chips.savings).toBe('₹482 saved');
  });

  it('prioritizes payment combo savings message', () => {
    const line = pickSmartInsightLine(baseInsight, 2000, 2);
    expect(line).toContain('₹482');
    expect(line).toContain('payment combo');
  });

  it('suggests bundle when one item in cart', () => {
    const line = pickSmartInsightLine(
      { ...baseInsight, savings: 0, recommendedPayment: 'Credit Card', estimatedDelivery: 'Friday' },
      200,
      1
    );
    expect(line).toContain('Add 1 more item');
  });
});
