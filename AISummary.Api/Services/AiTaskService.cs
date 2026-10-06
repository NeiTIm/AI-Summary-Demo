using System.Net.Http.Json;

namespace AISummary.Api.Services;

public class AiTaskService(HttpClient httpClient)
{
    public async Task<TaskExtractionResponse> ExtractTasksAsync(
        List<ChatMessageRequest> messages)
    {
        var request = new TaskExtractionRequest
        {
            Messages = messages
        };

        var response = await httpClient.PostAsJsonAsync(
            "/extract-tasks",
            request
        );

        response.EnsureSuccessStatusCode();

        var result = await response.Content
            .ReadFromJsonAsync<TaskExtractionResponse>();

        return result
            ?? throw new Exception("AI returned an empty task result.");
    }
}


public class TaskExtractionRequest
{
    public List<ChatMessageRequest> Messages { get; set; } = [];
}


public class TaskExtractionResponse
{
    public List<AiTask> Tasks { get; set; } = [];
}


public class AiTask
{
    public string Title { get; set; } = "";

    public string? Assignee { get; set; }

    public string? Deadline { get; set; }

    public string Status { get; set; } = "Pending";
}