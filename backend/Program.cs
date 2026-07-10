using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configurar o SQLite
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Data Source=expenses.db";
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString));

// Configurar Controllers com Serialização JSON apropriada (para ignorar loops ou tratar floats)
builder.Services.AddControllers();

// Configurar CORS para permitir que o front-end React acesse a API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Swagger/OpenAPI para documentação e testes
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Garantir que o banco de dados seja criado, as migrações aplicadas e dados limpos populados no startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        dbContext.Database.Migrate();

        // Popular banco com exatamente uma Alice e um Bob se estiver vazio
        if (!dbContext.People.Any())
        {
            var alice = new Person
            {
                Id = Guid.NewGuid(),
                Name = "Alice",
                Age = 12
            };

            var bob = new Person
            {
                Id = Guid.NewGuid(),
                Name = "Bob",
                Age = 30
            };

            dbContext.People.AddRange(alice, bob);

            var t1 = new Transaction
            {
                Id = Guid.NewGuid(),
                Description = "Livro escolar",
                Value = 75.50m,
                Type = "despesa",
                PersonId = alice.Id
            };

            var t2 = new Transaction
            {
                Id = Guid.NewGuid(),
                Description = "Salário",
                Value = 4200.00m,
                Type = "receita",
                PersonId = bob.Id
            };

            var t3 = new Transaction
            {
                Id = Guid.NewGuid(),
                Description = "Supermercado",
                Value = 320.40m,
                Type = "despesa",
                PersonId = bob.Id
            };

            dbContext.Transactions.AddRange(t1, t2, t3);
            dbContext.SaveChanges();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Erro ao rodar migrações/seeding: {ex.Message}");
    }
}

// Configurar pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

// Habilitar mapeamento de controllers
app.MapControllers();

app.Run();
