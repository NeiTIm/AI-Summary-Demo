namespace AISummary.Api.Models;

public class Conversation
{
    public int Id { get; set; }

    public string Type { get; set; } = "Private";

    public string? Name { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; }

    public int? DepartmentId { get; set; }

    public ICollection<ConversationMember> Members { get; set; }
        = new List<ConversationMember>();

    public ICollection<Message> Messages { get; set; }
        = new List<Message>();
}