namespace backend.Options
{
    public class GroqOptions
    {
        public const string SectionName = "Groq";

        public string ApiKey { get; set; } = "";
        public string Model { get; set; } = "llama3-8b-8192";
        public string BaseUrl { get; set; } = "https://api.groq.com/openai/v1";
    }
}
