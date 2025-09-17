using Microsoft.Extensions.Options;
using RealEstate.Api.Application;
using RealEstate.Api.Infrastructure.Mongo;
using RealEstate.Api.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// CORS (para dev; si usas proxy en Next, igual no estorba)
builder.Services.AddCors(opts =>
{
    opts.AddPolicy("frontend", p =>
        p.WithOrigins("http://localhost:3000", "http://127.0.0.1:3000")
         .AllowAnyHeader()
         .AllowAnyMethod());
});

// ----- Mongo Options desde ENV -----
builder.Services.Configure<MongoOptions>(o =>
{
    o.Uri = Environment.GetEnvironmentVariable("MONGODB_URI") ?? "mongodb://mongo:27017";
    o.Database = Environment.GetEnvironmentVariable("MONGODB_DB") ?? "realestate";
    o.PropertiesCollection = Environment.GetEnvironmentVariable("MONGODB_COLLECTION_PROPERTIES") ?? "properties";
    o.SeedOnStart = string.Equals(
        Environment.GetEnvironmentVariable("SEED_ON_START") ?? "false",
        "true",
        StringComparison.OrdinalIgnoreCase
    );
});

// Mongo + repos
builder.Services.AddSingleton<MongoContext>();
builder.Services.AddScoped<IPropertyRepository, PropertyRepository>();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("frontend");

app.MapGet("/health", () => Results.Ok(new { status = "ok", time = DateTime.UtcNow }));

app.MapControllers();

// ----- Seed en arranque (opcional, controlado por env) -----
using (var scope = app.Services.CreateScope())
{
    var opts = scope.ServiceProvider.GetRequiredService<IOptions<MongoOptions>>().Value;
    if (opts.SeedOnStart)
    {
        var ctx = scope.ServiceProvider.GetRequiredService<MongoContext>();
        var count = await ctx.Properties.EstimatedDocumentCountAsync();
        if (count == 0)
        {
            await ctx.Properties.InsertManyAsync(SeedData.Sample());
        }
    }
}

app.Run();
