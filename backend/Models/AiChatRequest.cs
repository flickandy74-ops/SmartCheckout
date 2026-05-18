namespace backend.Models
{
    /// <summary>Payload from Angular checkout chat — cart + AI insights + user question.</summary>
    public class AiChatRequest
    {
        public List<CartItemSummary> CartItems { get; set; } = new();
        public decimal TotalAmount { get; set; }
        public string DeliveryType { get; set; } = "";
        public int Savings { get; set; }
        public string PaymentMethod { get; set; } = "";
        public string UserQuestion { get; set; } = "";
    }

    public class CartItemSummary
    {
        public string Title { get; set; } = "";
        public decimal Price { get; set; }
    }
}
