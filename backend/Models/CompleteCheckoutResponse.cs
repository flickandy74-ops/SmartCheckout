namespace backend.Models
{
    public class CompleteCheckoutResponse
    {
        public string OrderId { get; set; } = "";
        public decimal CartTotal { get; set; }
        public int ItemCount { get; set; }
        public string Status { get; set; } = "Confirmed";
        public string Message { get; set; } = "";
    }
}
