# React + C# Record Manager

A small full-stack "record manager". A **C# .NET 10 Minimal API** serves a
hard-coded, in-memory list of vehicle records; a **React (Vite)** front end
lists them, lets you select and edit a record with controlled inputs, saves the
change back through the API, and shows live derived counts.

The front end is organized around **custom hooks**: data-fetching and editing
state each live in their own hook, presentational components take props only,
and pure helpers compute derived values. No external state library.

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
├── server/                     .NET 10 Minimal API
│   ├── Program.cs              endpoints + in-memory data (initialRecords)
│   ├── server.csproj           no PackageReferences
│   └── NuGet.config            package sources cleared (framework-only build)
└── client/                     React + Vite
    └── src/
        ├── main.jsx            root render
        ├── App.jsx             wires hooks to the view components
        ├── App.css             styles
        ├── api/
        │   └── records.js      fetch wrappers (fetchRecords, updateRecord)
        ├── hooks/
        │   ├── useRecords.js       load list + saveRecord (server state)
        │   └── useRecordEditor.js  selection + draft + save (edit state)
        ├── lib/
        │   └── derive.js       pure helpers (computeStatusCounts, isDirty)
        └── components/         presentational (props-only) components
            ├── SummaryBar.jsx  derived totals + per-status chips
            ├── RecordTable.jsx scrollable, selectable list
            └── RecordForm.jsx  controlled edit form
```

## Front-end architecture

- **`useRecords`** — owns server state: loads the list on mount (with a
  cancellation guard), tracks `loading`/`loadError`, and exposes `saveRecord`,
  which PUTs and swaps the returned row into the list immutably.
- **`useRecordEditor`** — owns edit state: `selectedId`, the editable `draft`,
  `saving`/`saveError`. `select` copies a record's fields into the draft;
  `changeField` updates one field; `save` skips when nothing is dirty, then
  delegates to `saveRecord`.
- **`lib/derive.js`** — pure functions (`computeStatusCounts`, `isDirty`) with
  no React dependency, memoized at the call site.
- **Components** — `SummaryBar`, `RecordTable`, `RecordForm` are props-only and
  hold no app state; `App.jsx` wires the hooks to them.
- **`api/records.js`** — the only place that talks HTTP; hooks depend on it, not
  on `fetch` directly.

Data flow is one-directional: hooks hold state → pass values + callbacks down as
props → component events call the callbacks → hooks update state → re-render.

## API

| Method | Route                | Purpose                              |
|--------|----------------------|--------------------------------------|
| GET    | `/api/records`       | All records                          |
| GET    | `/api/records/{id}`  | One record                           |
| PUT    | `/api/records/{id}`  | Update a record; returns the saved row |

Each record: `id` (number), `name`, `category`, `status`, `description`.
Seed data is six vehicles (trucks, EV, sedan, SUV, coupe); `status` is one of
`In Stock`, `Reserved`, `Sold`. Edits are held in the server's in-memory list
and persist for as long as the process runs. The `PUT` body is a partial
update — omitted fields keep their current value, and a blank `name` is
rejected with `400`.

## How the requirements are met

- **In-memory seed data** — `initialRecords` in `Program.cs` holds six vehicle
  records; a copy backs the live list, guarded by a lock.
- **List rendering with stable keys** — `RecordTable` maps records to `<tr>`
  with `key={record.id}`.
- **Scrollable, multi-column list** — four columns (ID, Name, Category, Status)
  in a scroll container, with a colored status chip.
- **Row selection & detail panel** — clicking (or Enter/Space on) a row calls
  `useRecordEditor.select`, copying its editable fields into the draft.
- **Controlled inputs** — every field in `RecordForm` is driven by `draft`
  state and a `changeField` handler; nothing is uncontrolled.
- **Immutable updates** — selection and edits never mutate arrays/objects in
  place; state is replaced with new objects (`{ ...prev }`, `map`). The server
  likewise replaces the list element using a `with` expression.
- **Save through the API** — `save` skips when nothing is dirty, issues a `PUT`
  via `updateRecord`, then the returned row replaces the matching item in state,
  so the list and detail stay in sync.
- **Derived output computed from current state** — total, selected count, and
  the per-status breakdown are computed during render (memoized), never stored
  separately, so they stay accurate after every edit.
