import { CheckoutInsight } from '../../services/ai.service';

/** Human-readable chip labels for the compact insights row. */
export function formatInsightChips(insights: CheckoutInsight) {
  const payment = insights.recommendedPayment ?? '';
  const delivery = insights.estimatedDelivery ?? '';
  const score = insights.aiScore ?? 0;
  const savings = insights.savings ?? 0;

  return {
    savings: savings > 0 ? `₹${savings} saved` : null,
    payment: formatPaymentChip(payment),
    delivery: formatDeliveryChip(delivery),
    score: `${score}% Score`
  };
}

/** One-line conversational insight for the top of the card. */
export function pickSmartInsightLine(
  insights: CheckoutInsight,
  cartTotal: number,
  itemCount: number
): string {
  const savings = insights.savings ?? 0;
  const payment = (insights.recommendedPayment ?? '').toLowerCase();
  const delivery = (insights.estimatedDelivery ?? '').toLowerCase();

  if (cartTotal <= 0) {
    return '✨ Add items to see personalized checkout tips';
  }

  const bundleExtra = estimateBundleExtraSavings(cartTotal, savings);

  if (itemCount === 1 && cartTotal < 1500) {
    return '🔥 Add 1 more item to unlock extra savings';
  }

  if (bundleExtra > 0 && cartTotal >= 500 && cartTotal < 1500) {
    return `📦 Bundle recommendation can save you ₹${bundleExtra} more`;
  }

  if (cartTotal > 0 && cartTotal < 500) {
    const gap = Math.ceil(500 - cartTotal);
    return `🔥 Add ₹${gap} more to unlock bundle savings`;
  }

  if (savings >= 80 && (payment.includes('upi') || payment.includes('cashback'))) {
    return `🎉 You saved ₹${savings} with the smartest payment combo`;
  }

  if (payment.includes('upi') || payment.includes('cashback')) {
    return '💳 UPI cashback gives you the best value today';
  }

  if (
    delivery.includes('tomorrow') ||
    delivery.includes('express') ||
    cartTotal >= 1500
  ) {
    return '🚚 Express delivery available at no extra cost';
  }

  if (savings > 0) {
    return `🎉 You're saving ₹${savings} on this checkout`;
  }

  const short = (insights.message ?? '').split(/[.!]/)[0]?.trim();
  if (short && short.length < 72) {
    return `✨ ${short}`;
  }

  return '✨ Your checkout is tuned for the best value today';
}

function formatPaymentChip(payment: string): string {
  const lower = payment.toLowerCase();
  if (lower.includes('upi')) return 'UPI Cashback';
  if (lower.includes('credit')) return 'Credit Card';
  if (lower.includes('debit')) return 'Debit Card';
  if (lower.includes('wallet')) return 'Wallet';
  return payment;
}

function formatDeliveryChip(delivery: string): string {
  const lower = delivery.toLowerCase();
  if (lower.includes('tomorrow')) return 'Tomorrow Delivery';
  if (lower.includes('express')) return 'Express Delivery';
  if (lower.includes('friday')) return 'Friday Delivery';
  if (lower.includes('standard')) return 'Standard Delivery';
  return delivery.length > 22 ? delivery.split('(')[0].trim() : delivery;
}

/** Rough extra savings if the cart reaches the next AI tier (mirrors backend tiers). */
function estimateBundleExtraSavings(cartTotal: number, currentSavings: number): number {
  if (cartTotal < 500) {
    const atTier = 80;
    return Math.max(50, atTier - currentSavings);
  }
  if (cartTotal < 1500) {
    const atTier =
      80 +
      Math.round((1500 - 500) * 0.12) +
      Math.round(1500 * 0.05);
    return Math.max(40, atTier - currentSavings);
  }
  return 0;
}
