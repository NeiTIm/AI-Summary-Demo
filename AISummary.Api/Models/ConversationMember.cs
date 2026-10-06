namespace AISummary.Api.Models;

public class ConversationMember
{
    public int ConversationId { get; set; }

    public Conversation Conversation { get; set; } = null!;

    public int UserId { get; set; }

    public User User { get; set; } = null!;

    public string Role { get; set; } = "Member";

    public DateTime JoinedAt { get; set; }

    public DateTime? HistoryDeletedAt { get; set; }
}