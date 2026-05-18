using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using backend.Models;
using backend.Options;
using Microsoft.Extensions.Options;

namespace backend.Services
{
    /// <summary>
    /// Calls Groq OpenAI-compatible chat API (llama3-8b-8192).
    /// Flow: Angular POST /api/ai-chat → this service → Groq → short reply back to UI.
    /// </summary>
    public class GroqChatService : IGroqChatService
    {
        private readonly HttpClient _http;
        private readonly GroqOptions _options;
        private readonly ILogger<GroqChatService> _logger;

        public GroqChatService(
            HttpClient http,
            IOptions<GroqOptions> options,
            ILogger<GroqChatService> logger)
        {
            _http = http;
            _options = options.Value;
            _logger = logger;
        }

        public async Task<AiChatResponse> GetReplyAsync(
            AiChatRequest request,
            CancellationToken cancellationToken = default)
        {
            var apiKey = ResolveApiKey();
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                return new AiChatResponse
                {
                    Reply = BuildOfflineReply(request)
                };
            }

            var systemPrompt = """
                You are SmartCheckout AI Copilot at checkout. Answer in 2-4 short sentences.
                Be specific using the cart data provided. Use ₹ for money. No markdown bullets.
                Topics: savings, delivery, payment, reducing total, best value.
                """;

            var userPrompt = BuildContextPrompt(request);

            var body = new
            {
                model = _options.Model,
                messages = new object[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = userPrompt }
                },
                max_tokens = 220,
                temperature = 0.6
            };

            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                $"{_options.BaseUrl.TrimEnd('/')}/chat/completions");

            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            httpRequest.Content = new StringContent(
                JsonSerializer.Serialize(body),
                Encoding.UTF8,
                "application/json");

            try
            {
                using var response = await _http.SendAsync(httpRequest, cancellationToken);
                var json = await response.Content.ReadAsStringAsync(cancellationToken);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Groq API error {Status}: {Body}", response.StatusCode, json);
                    return new AiChatResponse { Reply = BuildOfflineReply(request) };
                }

                var parsed = JsonSerializer.Deserialize<GroqChatCompletionResponse>(json);
                var content = parsed?.Choices?.FirstOrDefault()?.Message?.Content?.Trim();

                if (string.IsNullOrWhiteSpace(content))
                {
                    return new AiChatResponse { Reply = BuildOfflineReply(request) };
                }

                return new AiChatResponse { Reply = content };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Groq request failed");
                return new AiChatResponse { Reply = BuildOfflineReply(request) };
            }
        }

        private string? ResolveApiKey()
        {
            if (!string.IsNullOrWhiteSpace(_options.ApiKey))
                return _options.ApiKey;

            return Environment.GetEnvironmentVariable("GROQ_API_KEY");
        }

        private static string BuildContextPrompt(AiChatRequest request)
        {
            var items = request.CartItems.Count == 0
                ? "Cart is empty."
                : string.Join(", ", request.CartItems.Select(i => $"{i.Title} (₹{i.Price})"));

            return $"""
                Cart items: {items}
                Total: ₹{request.TotalAmount}
                Delivery: {request.DeliveryType}
                AI savings: ₹{request.Savings}
                Recommended payment: {request.PaymentMethod}

                Shopper question: {request.UserQuestion}
                """;
        }

        /// <summary>Rule-based fallback when Groq key is missing or API fails (demo-safe).</summary>
        private static string BuildOfflineReply(AiChatRequest request)
        {
            var q = request.UserQuestion.ToLowerInvariant();

            if (q.Contains("save") || q.Contains("saving"))
                return $"You can save ₹{request.Savings} on this cart (₹{request.TotalAmount} total). Add bundle-tier items or pay with {request.PaymentMethod} to unlock more cashback.";

            if (q.Contains("delivery"))
                return $"Best delivery for your cart: {request.DeliveryType}. Express is auto-selected when your total qualifies — no extra form needed.";

            if (q.Contains("payment") || q.Contains("pay"))
                return $"Use {request.PaymentMethod} for fastest confirmation and the best perks on ₹{request.TotalAmount}. COD adds verification delay.";

            if (q.Contains("reduce") || q.Contains("cost") || q.Contains("total"))
                return $"Current total is ₹{request.TotalAmount}. Removing items or hitting a higher savings tier changes what AI can optimize. Estimated savings now: ₹{request.Savings}.";

            if (q.Contains("value") || q.Contains("best"))
                return $"Best value: keep your cart near bundle thresholds, use {request.PaymentMethod}, and {request.DeliveryType} — AI already picked that path for you.";

            return $"Your cart is ₹{request.TotalAmount} with ₹{request.Savings} savings. Recommended: {request.PaymentMethod} + {request.DeliveryType}. Ask about savings, delivery, or payment!";
        }

        private sealed class GroqChatCompletionResponse
        {
            [JsonPropertyName("choices")]
            public List<GroqChoice>? Choices { get; set; }
        }

        private sealed class GroqChoice
        {
            [JsonPropertyName("message")]
            public GroqMessage? Message { get; set; }
        }

        private sealed class GroqMessage
        {
            [JsonPropertyName("content")]
            public string? Content { get; set; }
        }
    }
}
