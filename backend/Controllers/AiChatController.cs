using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;

namespace backend.Controllers
{
    /// <summary>
    /// AI chat for checkout copilot.
    /// Flow: Angular AiChatService → POST /api/ai-chat → GroqChatService → Groq API (llama3-8b-8192).
    /// </summary>
    [ApiController]
    [Route("api/ai-chat")]
    public class AiChatController : ControllerBase
    {
        private readonly IGroqChatService _groqChat;

        public AiChatController(IGroqChatService groqChat)
        {
            _groqChat = groqChat;
        }

        [HttpPost]
        public async Task<ActionResult<AiChatResponse>> Chat(
            [FromBody] AiChatRequest request,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.UserQuestion))
            {
                return BadRequest(new { message = "Question is required." });
            }

            var reply = await _groqChat.GetReplyAsync(request, cancellationToken);
            return Ok(reply);
        }
    }
}
