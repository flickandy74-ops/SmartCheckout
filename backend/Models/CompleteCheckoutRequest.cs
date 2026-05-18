namespace backend.Models
{
    public class CompleteCheckoutRequest
    {
        public decimal CartTotal { get; set; }
        public int ItemCount { get; set; }
        public string? LastProductContext { get; set; }
    }
}
