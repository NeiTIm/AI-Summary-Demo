using System.Net.Http.Json;

namespace AISummary.Api.Services;

public class AiSummaryService(HttpClient httpClient)
{
    public async Task<HttpResponseMessage> StreamSummaryAsync(
        List<ChatMessageRequest> messages)
    {
        var request = new SummarizeRequest
        {
            Messages = messages
        };

        using var httpRequest = new HttpRequestMessage(
            HttpMethod.Post,
            "/summarize"
        )
        {
            Content = JsonContent.Create(request)
        };

        return await httpClient.SendAsync(
            httpRequest,
            HttpCompletionOption.ResponseHeadersRead
        );
    }
}


public class ChatMessageRequest
{
    public string Sender { get; set; } = "";

    public string Content { get; set; } = "";
}


public class SummarizeRequest
{
    public List<ChatMessageRequest> Messages { get; set; } = [];
}


public class SummarizeResponse
{
    public string Summary { get; set; } = "";
}