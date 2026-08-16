# React + C# Record Manager

A small full-stack "record manager". A **C# .NET 10 Minimal API** serves a
hard-coded, in-memory list of project records; a **React (Vite)** front end
lists them, lets you select and edit a record with controlled inputs, saves the
change back through the API, and shows live derived counts.

No database, no external services, and no packages beyond each project's
template.

## Requirements

- **.NET SDK 10.0+** (`dotnet --version`)
- **Node.js 18+** and npm (`node --version`)

## Running it (two terminals)

**Terminal 1 — backend (http://localhost:5105):**

```bash
cd server
dotnet run
```

**Terminal 2 — frontend (http://localhost:5173):**

```bash
cd client
npm install      # first time only
npm run dev
```

Open http://localhost:5173. Start the backend first so the initial load
succeeds; the backend allows the front-end origin via CORS.

## Project layout

```
react-csharp-record-manager/
├── server/                 .NET 8 Minimal API
│   ├── Program.cs          endpoints + in-memory data (initialRecords)
│   ├── server.csproj       no PackageReferences
│   └── NuGet.config        package sources cleared (framework-only build)
└── client/                 React + Vite
    └── src/
        ├── api.js          fetch wrapper for the API
        ├── App.jsx         list, detail/edit panel, derived summary
        └── App.css         styles
```

## API

| Method | Route                | Purpose                              |
|--------|----------------------|--------------------------------------|
| GET    | `/api/records`       | All records                          |
| GET    | `/api/records/{id}`  | One record                           |
| PUT    | `/api/records/{id}`  | Update a record; returns the saved row |

Each record: `id` (number), `name`, `category`, `status`, `description`.
Edits are held in the server's in-memory list and persist for as long as the
process runs.

## How the requirements are met

- **In-memory seed data** — `initialRecords` in `Program.cs` holds six project
  records; a copy backs the live list.
- **List rendering with stable keys** — the table maps records to `<tr>` with
  `key={record.id}`.
- **Scrollable, multi-column list** — four columns (ID, Name, Category, Status)
  in a scroll container.
- **Row selection & detail panel** — clicking (or Enter/Space on) a row selects
  it and copies its values into the edit form.
- **Controlled inputs** — every field is driven by React state (`draft`) and an
  `onChange` handler; nothing is uncontrolled.
- **Immutable updates** — selection and edits never mutate arrays/objects in
  place; state is replaced with new objects (`{ ...prev }`, `map`). The server
  likewise replaces the list element using a `with` expression.
- **Save through the API** — `Save` issues a `PUT`, then the returned row
  replaces the matching item in state, so the list and detail stay in sync.
- **Derived output computed from current state** — total records, selected count
  (0 or 1), and a per-status breakdown are all calculated during render, never
  stored separately, so they stay accurate after every edit.
