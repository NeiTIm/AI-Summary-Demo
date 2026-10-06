namespace AISummary.Api.Models;

public class User
{
    public int Id { get; set; }

    public string Username { get; set; } = "";

    public string FullName { get; set; } = "";

    public string Email { get; set; } = "";

    public string Role { get; set; } = "Employee";

    public bool IsActive { get; set; } = true;

    public bool IsDeleted { get; set; }

    public ICollection<ConversationMember> ConversationMembers { get; set; }
        = new List<ConversationMember>();

    public ICollection<Message> Messages { get; set; }
        = new List<Message>();
}