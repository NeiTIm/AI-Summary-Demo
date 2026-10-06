using AISummary.Api.Data;
using AISummary.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AISummary.Api.Controllers;

[ApiController]
[Route("api/conversations")]
public class ConversationsController(
    AppDbContext db,
    AiSummaryService aiSummaryService,
    AiTaskService aiTaskService) : ControllerBase
{
    // =========================================================
    // GET: /api/conversations/{conversationId}/messages
    // =========================================================

    [HttpGet("{conversationId:int}/messages")]
    public async Task<IActionResult> GetMessages(int conversationId)
    {
        var conversation = await db.Conversations
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == conversationId);

        if (conversation == null)
        {
            return NotFound(new
            {
                message = "Conversation not found."
            });
        }

        var messages = await db.Messages
            .AsNoTracking()
            .Where(x =>
                x.ConversationId == conversationId &&
                !x.IsDeleted
            )
            .OrderBy(x => x.SentAt)
            .Select(x => new
            {
                id = x.Id,
                senderId = x.SenderId,
                sender = x.Sender.FullName,
                content = x.Content,
                sentAt = x.SentAt
            })
            .ToListAsync();

        return Ok(new
        {
            conversationId = conversation.Id,
            conversationName = conversation.Name,
            conversationType = conversation.Type,
            messageCount = messages.Count,
            messages
        });
    }


    // =========================================================
    // POST: /api/conversations/{conversationId}/summary
    // STREAMING
    // =========================================================

    [HttpPost("{conversationId:int}/summary")]
    public async Task SummarizeConversation(
        int conversationId)
    {
        var conversation = await db.Conversations
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == conversationId);

        if (conversation == null)
        {
            Response.StatusCode =
                StatusCodes.Status404NotFound;

            await Response.WriteAsJsonAsync(new
            {
                message = "Conversation not found."
            });

            return;
        }

        var messages = await db.Messages
            .AsNoTracking()
            .Where(x =>
                x.ConversationId == conversationId &&
                !x.IsDeleted
            )
            .OrderBy(x => x.SentAt)
            .Select(x => new ChatMessageRequest
            {
                Sender = x.Sender.FullName,
                Content = x.Content
            })
            .ToListAsync();

        if (messages.Count == 0)
        {
            Response.StatusCode =
                StatusCodes.Status400BadRequest;

            await Response.WriteAsJsonAsync(new
            {
                message = "Conversation has no messages."
            });

            return;
        }

        try
        {
            var aiResponse =
                await aiSummaryService
                    .StreamSummaryAsync(messages);

            if (!aiResponse.IsSuccessStatusCode)
            {
                var errorBody =
                    await aiResponse.Content
                        .ReadAsStringAsync();

                Response.StatusCode =
                    (int)aiResponse.StatusCode;

                await Response.WriteAsJsonAsync(new
                {
                    message =
                        "AI Service returned an error.",

                    detail = errorBody
                });

                return;
            }

            Response.StatusCode =
                StatusCodes.Status200OK;

            Response.ContentType =
                "text/plain; charset=utf-8";

            Response.Headers.CacheControl =
                "no-cache";

            await using var stream =
                await aiResponse.Content
                    .ReadAsStreamAsync();

            var buffer = new byte[1024];

            int bytesRead;

            while (
                (bytesRead =
                    await stream.ReadAsync(buffer)) > 0
            )
            {
                await Response.Body.WriteAsync(
                    buffer.AsMemory(
                        0,
                        bytesRead
                    )
                );

                await Response.Body.FlushAsync();
            }
        }
        catch (HttpRequestException ex)
        {
            Response.StatusCode =
                StatusCodes.Status503ServiceUnavailable;

            await Response.WriteAsJsonAsync(new
            {
                message =
                    "AI Service is unavailable.",

                detail = ex.Message
            });
        }
        catch (Exception ex)
        {
            Response.StatusCode =
                StatusCodes.Status500InternalServerError;

            await Response.WriteAsJsonAsync(new
            {
                message =
                    "Failed to generate AI summary.",

                detail = ex.Message
            });
        }
    }

    [HttpPost("{conversationId:int}/tasks")]
    public async Task<IActionResult> ExtractTasks(int conversationId)
    {
        var conversation = await db.Conversations
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == conversationId);

        if (conversation == null)
        {
            return NotFound(new
            {
                message = "Conversation not found."
            });
        }

        var messages = await db.Messages
            .AsNoTracking()
            .Where(x =>
                x.ConversationId == conversationId &&
                !x.IsDeleted
            )
            .OrderBy(x => x.SentAt)
            .Select(x => new ChatMessageRequest
            {
                Sender = x.Sender.FullName,
                Content = x.Content
            })
            .ToListAsync();

        if (messages.Count == 0)
        {
            return BadRequest(new
            {
                message = "Conversation has no messages."
            });
        }

        try
        {
            var result = await aiTaskService.ExtractTasksAsync(
                messages
            );

            return Ok(new
            {
                conversationId = conversation.Id,
                conversationName = conversation.Name,
                messageCount = messages.Count,
                tasks = result.Tasks
            });
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(503, new
            {
                message = "AI Service is unavailable.",
                detail = ex.Message
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Failed to extract AI tasks.",
                detail = ex.Message
            });
        }
    }
}