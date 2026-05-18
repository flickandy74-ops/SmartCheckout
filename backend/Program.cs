using System.Text.Json;
using backend.Options;
using backend.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Serialize all API responses as camelCase
        // so Angular template (insights.savings) matches backend (Savings)
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<AiRecommendationService>();

// Groq HTTP client for POST /api/ai-chat → Groq llama3-8b-8192
builder.Services.Configure<GroqOptions>(builder.Configuration.GetSection(GroqOptions.SectionName));
builder.Services.AddHttpClient<IGroqChatService, GroqChatService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

app.UseSwagger();

app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseCors("AllowAngular");

app.UseAuthorization();

app.MapControllers();

app.Run();