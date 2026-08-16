var builder = WebApplication.CreateBuilder(args);

const string DevCorsPolicy = "AllowReactDevServer";
builder.Services.AddCors(options =>
{
    options.AddPolicy(DevCorsPolicy, policy =>
        policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();
app.UseCors(DevCorsPolicy);

var initialRecords = new List<RecordItem>
{
    new(1, "Ford F-150",      "Truck", "In Stock", "Full-size pickup, 3.5L V6 EcoBoost, crew cab."),
    new(2, "Tesla Model 3",   "EV",    "Reserved", "Long-range dual motor, autopilot, 358-mile range."),
    new(3, "Toyota Camry",    "Sedan", "Sold",     "Hybrid LE, 51 mpg city, single owner."),
    new(4, "Honda CR-V",      "SUV",   "In Stock", "AWD compact crossover, lane-keep assist."),
    new(5, "Rivian R1T",      "Truck", "Reserved", "Electric adventure truck, quad motor, 328-mile range."),
    new(6, "Mazda MX-5",      "Coupe", "In Stock", "Roadster, 6-speed manual, soft top."),
};

var records = new List<RecordItem>(initialRecords);
var gate = new object();

app.MapGet("/api/records", () =>
{
    lock (gate) return Results.Ok(records.ToList());
});

app.MapGet("/api/records/{id:int}", (int id) =>
{
    lock (gate)
    {
        var found = records.FirstOrDefault(r => r.Id == id);
        return found is null ? Results.NotFound() : Results.Ok(found);
    }
});

app.MapPut("/api/records/{id:int}", (int id, RecordUpdate update) =>
{
    lock (gate)
    {
        var index = records.FindIndex(r => r.Id == id);
        if (index < 0) return Results.NotFound();

        var name = update.Name ?? records[index].Name;
        if (string.IsNullOrWhiteSpace(name))
            return Results.BadRequest("Name is required.");

        var saved = records[index] with
        {
            Name = name,
            Category = update.Category ?? records[index].Category,
            Status = update.Status ?? records[index].Status,
            Description = update.Description ?? records[index].Description,
        };

        records[index] = saved;
        return Results.Ok(saved);
    }
});

app.Run();

record RecordItem(int Id, string Name, string Category, string Status, string Description);

record RecordUpdate(string? Name, string? Category, string? Status, string? Description);
