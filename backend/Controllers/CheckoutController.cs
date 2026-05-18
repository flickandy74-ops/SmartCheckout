using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CheckoutController : ControllerBase
    {
        private readonly AiRecommendationService _aiService;

        public CheckoutController(AiRecommendationService aiService)
        {
            _aiService = aiService;
        }

        [HttpGet("analyze/{cartTotal}")]
        public IActionResult AnalyzeCart(decimal cartTotal, [FromQuery] string? context = null)
        {
            var result = _aiService.AnalyzeCart(cartTotal, context);
            return Ok(result);
        }

        [HttpPost("complete")]
        public IActionResult Complete([FromBody] CompleteCheckoutRequest request)
        {
            if (request.CartTotal <= 0 || request.ItemCount <= 0)
            {
                return BadRequest(new { message = "Cart is empty." });
            }

            var analysis = _aiService.AnalyzeCart(request.CartTotal, request.LastProductContext);
            var orderId = $"SC-{Guid.NewGuid():N}"[..12].ToUpperInvariant();

            return Ok(new CompleteCheckoutResponse
            {
                OrderId = orderId,
                CartTotal = request.CartTotal,
                ItemCount = request.ItemCount,
                Status = "Confirmed",
                Message = analysis.Message
            });
        }
    }
}
