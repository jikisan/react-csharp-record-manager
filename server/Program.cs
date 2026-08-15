// Record Manager API — .NET 8 Minimal API
// No external NuGet packages: uses only what ships with Microsoft.NET.Sdk.Web
// (System.Text.Json is part of the framework). All data is hard-coded and
// held in-memory for the lifetime of the running process.

var builder = WebApplication.CreateBuilder(args);

// Allow the React dev server (Vite default port) to call this API from the browser.
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

// ---------------------------------------------------------------------------
// In-memory data store
// ---------------------------------------------------------------------------
// initialRecords seeds the store. The `records` list is the single source of
// truth on the server and is mutated in place (by replacing an element) when a
// client saves an edit. State survives for as long as the app is running.
var initialRecords = new List<RecordItem>
{
    new(1, "Apollo Migration",   "Engineering", "Active",    "Migrate the legacy billing service to the new cloud platform."),
    new(2, "Orion Redesign",     "Design",      "On Hold",   "Refresh the marketing site with the updated brand system."),
    new(3, "Helios Analytics",   "Data",        "Active",    "Build the executive KPI dashboard from the warehouse."),
    new(4, "Vega Onboarding",    "Product",     "Completed", "Revamp the first-run experience for new customers."),
    new(5, "Titan Security",     "Engineering", "Active",    "Roll out single sign-on and audit logging across services."),
    new(6, "Nova Support Portal","Product",     "On Hold",   "Self-service help center to reduce inbound support tickets."),
};

var records = new List<RecordItem>(initialRecords);
var gate = new object(); // guards writes to the shared list

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

// Return all records.
app.MapGet("/api/records", () => Results.Ok(records));

// Return a single record by id.
app.MapGet("/api/records/{id:int}", (int id) =>
{
    var found = records.FirstOrDefault(r => r.Id == id);
    return found is null ? Results.NotFound() : Results.Ok(found);
});

// Update an existing record. The id in the route wins; the body carries the
// editable fields. We replace the element rather than mutating it, then return
// the saved record so the client can sync its UI.
app.MapPut("/api/records/{id:int}", (int id, RecordUpdate update) =>
{
    lock (gate)
    {
        var index = records.FindIndex(r => r.Id == id);
        if (index < 0) return Results.NotFound();

        var saved = records[index] with
        {
            Name = update.Name ?? records[index].Name,
            Category = update.Category ?? records[index].Category,
            Status = update.Status ?? records[index].Status,
            Description = update.Description ?? records[index].Description,
        };

        records[index] = saved;
        return Results.Ok(saved);
    }
});

app.Run();

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------

// The stored record. Using a positional record type gives value semantics and a
// convenient `with` expression for immutable-style updates.
record RecordItem(int Id, string Name, string Category, string Status, string Description);

// The editable payload for a PUT. Every field is optional so a partial update
// only overwrites what the client actually sent.
record RecordUpdate(string? Name, string? Category, string? Status, string? Description);
