using AISummary.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AISummary.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options)
{
    public DbSet<User> Users => Set<User>();

    public DbSet<Conversation> Conversations => Set<Conversation>();

    public DbSet<ConversationMember> ConversationMembers => Set<ConversationMember>();

    public DbSet<Message> Messages => Set<Message>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ================================
        // User
        // ================================

        modelBuilder.Entity<User>()
            .HasIndex(x => x.Username)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(x => x.Email)
            .IsUnique();


        // ================================
        // ConversationMember
        // ================================

        modelBuilder.Entity<ConversationMember>()
            .HasKey(x => new
            {
                x.ConversationId,
                x.UserId
            });

        modelBuilder.Entity<ConversationMember>()
            .HasOne(x => x.Conversation)
            .WithMany(x => x.Members)
            .HasForeignKey(x => x.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ConversationMember>()
            .HasOne(x => x.User)
            .WithMany(x => x.ConversationMembers)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);


        // ================================
        // Message
        // ================================

        modelBuilder.Entity<Message>()
            .HasOne(x => x.Conversation)
            .WithMany(x => x.Messages)
            .HasForeignKey(x => x.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Message>()
            .HasOne(x => x.Sender)
            .WithMany(x => x.Messages)
            .HasForeignKey(x => x.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Message>()
            .HasOne(x => x.ReplyToMessage)
            .WithMany()
            .HasForeignKey(x => x.ReplyToMessageId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}