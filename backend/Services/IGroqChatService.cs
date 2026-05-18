using backend.Models;

namespace backend.Services
{
  public interface IGroqChatService
  {
    Task<AiChatResponse> GetReplyAsync(AiChatRequest request, CancellationToken cancellationToken = default);
  }
}
