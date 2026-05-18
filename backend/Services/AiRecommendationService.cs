using backend.Models;

namespace backend.Services
{
    public class AiRecommendationService
    {
        public CheckoutInsight AnalyzeCart(decimal cartTotal, string? productContext = null)
        {
            int savings = 0;
            int aiScore = 60;
            string payment = "Credit Card";
            string delivery = "Friday";
            string recommendation = "AI is analyzing your checkout behavior.";
            string message = "Add more products for better optimization.";
            string feeExplanation = "No platform fees on this demo store.";
            string deliveryTradeoff = "Standard delivery (3–5 days) is free. Express costs more but arrives sooner.";
            string paymentTradeoff = "Credit cards: universal acceptance. UPI: faster confirmation and cashback on larger carts.";

            if (cartTotal <= 0)
            {
                return BuildInsight(0, payment, delivery, aiScore, recommendation,
                    "Your cart is empty.", feeExplanation, deliveryTradeoff, paymentTradeoff);
            }

            var contextNote = string.IsNullOrWhiteSpace(productContext)
                ? ""
                : $" Continuing from {productContext.Trim()} — no need to re-enter preferences.";

            if (cartTotal >= 500)
            {
                savings = 80 + (int)((cartTotal - 500) * 0.12m);
                payment = "UPI Cashback";
                aiScore = 82;
                recommendation = "AI detected bundle savings and UPI cashback for your cart.";
                message = $"Estimated savings ₹{savings} applied automatically.{contextNote}";
                feeExplanation = "Platform fee waived. Bundle discount stacks with UPI cashback.";
                deliveryTradeoff = "Free standard by Friday, or upgrade to express when cart crosses ₹1,500.";
                paymentTradeoff = "UPI recommended: ~2% cashback vs credit card with no extra perks at this tier.";
            }

            if (cartTotal >= 1500)
            {
                savings += (int)(cartTotal * 0.05m);
                delivery = "Tomorrow (Express)";
                aiScore = 90;
                recommendation = "Express delivery unlocked — AI removed the shipping choice step.";
                message = $"You save ₹{savings} total including express shipping.{contextNote}";
                feeExplanation = "All fees included in price. Express shipping fee absorbed by bundle tier.";
                deliveryTradeoff = "Express tomorrow selected automatically — saves one checkout step vs picking delivery manually.";
                paymentTradeoff = "UPI still best: instant confirmation + cashback. COD would add 1–2 day payment verification.";
            }

            if (cartTotal >= 5000)
            {
                savings += (int)(cartTotal * 0.08m);
                aiScore = 97;
                recommendation = "Premium AI optimization: max savings, fastest delivery, best payment path.";
                message = $"Maximum optimization — ₹{savings} saved, premium checkout path.{contextNote}";
                feeExplanation = "Zero hidden fees. Premium tier bundles waive express and payment surcharges.";
                deliveryTradeoff = "Express tomorrow locked in — no delivery form needed.";
                paymentTradeoff = "UPI pre-selected for fastest settlement; card available as fallback without re-asking address.";
            }

            return BuildInsight(savings, payment, delivery, aiScore, recommendation, message,
                feeExplanation, deliveryTradeoff, paymentTradeoff);
        }

        private static CheckoutInsight BuildInsight(
            int savings, string payment, string delivery, int aiScore,
            string recommendation, string message,
            string feeExplanation, string deliveryTradeoff, string paymentTradeoff)
        {
            return new CheckoutInsight
            {
                Savings = savings,
                RecommendedPayment = payment,
                EstimatedDelivery = delivery,
                AiScore = aiScore,
                Recommendation = recommendation,
                Message = message,
                FeeExplanation = feeExplanation,
                DeliveryTradeoff = deliveryTradeoff,
                PaymentTradeoff = paymentTradeoff
            };
        }
    }
}
