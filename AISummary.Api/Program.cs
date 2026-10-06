using AISummary.Api.Data;
using AISummary.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

builder.Services.AddHttpClient<AiSummaryService>(client =>
{
    client.BaseAddress = new Uri("http://localhost:8000");
});

builder.Services.AddHttpClient<AiTaskService>(client =>
{
    client.BaseAddress = new Uri("http://localhost:8000");
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactClient", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddControllers();

var app = builder.Build();

// CORS phải được bật trước MapControllers
app.UseCors("ReactClient");

// Không dùng HTTPS redirect khi đang chạy local bằng HTTP
// app.UseHttpsRedirection();

app.MapControllers();

app.Run();