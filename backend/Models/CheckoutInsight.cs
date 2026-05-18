namespace backend.Models
{
    public class CheckoutInsight
    {
        public int Savings { get; set; }

        public string RecommendedPayment { get; set; } = "";

        public string EstimatedDelivery { get; set; } = "";

        public int AiScore { get; set; }

        public string Recommendation { get; set; } = "";

        public string Message { get; set; } = "";

        public string FeeExplanation { get; set; } = "";

        public string DeliveryTradeoff { get; set; } = "";

        public string PaymentTradeoff { get; set; } = "";
    }
}
