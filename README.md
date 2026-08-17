# React + C# Record Manager

A small full-stack "record manager". A **C# .NET 10 Minimal API** serves a
hard-coded, in-memory list of vehicle records; a **React (Vite)** front end
lists them, lets you select and edit a record with controlled inputs, saves the
change back through the API, and shows live derived counts.

The front end is built on a **Model–View–Intent (MVI)** store: a single
immutable state tree, pure reducer, plain action creators, async intents, and
memoized selectors — no external state library.

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
        ├── main.jsx            root render, wraps App in StoreProvider
        ├── App.jsx             wires state/intents to the view components
        ├── App.css             styles
        ├── components/         presentational (props-only) components
        │   ├── SummaryBar.jsx  derived totals + per-status chips
        │   ├── RecordTable.jsx scrollable, selectable list
        │   └── RecordForm.jsx  controlled edit form
        ├── services/
        │   └── RecordService.js  API abstraction (HttpRecordService)
        └── store/              MVI store
            ├── state.js        initialState + editable-field helpers
            ├── actions.js      ActionType enum + action creators
            ├── reducer.js      pure (state, action) → state
            ├── intents.js      async intents (load/select/change/save)
            ├── selectors.js    derived reads (selected, counts, isDirty)
            └── StoreProvider.jsx  context + useReducer, useAppState/useIntents hooks
```

## Front-end architecture (MVI)

- **Model** — one immutable `state` tree (`store/state.js`) held by
  `useReducer` inside `StoreProvider`. Never mutated in place.
- **View** — `App.jsx` plus the props-only components in `components/`. Reads
  state through `useAppState(selector)`, fires intents from event handlers.
- **Intent** — `store/intents.js` exposes `load`, `select`, `changeField`, and
  `save`. Intents own async work (talking to the service) and dispatch actions;
  the pure **reducer** (`store/reducer.js`) applies each action to produce the
  next state.
- **Selectors** — `store/selectors.js` derives everything (selected record,
  selected count, per-status counts, dirty flag) from state during render, so
  the UI and summary stay accurate after every edit.
- **Service layer** — `services/RecordService.js` defines a `RecordService`
  interface; `HttpRecordService` is the fetch-based implementation. It is
  injected via `StoreProvider`'s `service` prop, so a fake can be swapped in
  for tests.

Data flow is one-directional: **view → intent → dispatch → reducer → new state
→ view**.

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
- **Row selection & detail panel** — clicking (or Enter/Space on) a row fires
  the `select` intent; the reducer copies its editable fields into `draft`.
- **Controlled inputs** — every field in `RecordForm` is driven by `draft`
  state and a `changeField` intent; nothing is uncontrolled.
- **Immutable updates** — the reducer never mutates arrays/objects in place;
  state is replaced with new objects (`{ ...state }`, `map`). The server
  likewise replaces the list element using a `with` expression.
- **Save through the API** — the `save` intent skips when nothing is dirty,
  issues a `PUT` via the service, then the returned row replaces the matching
  item in state, so the list and detail stay in sync.
- **Derived output computed from current state** — total, selected count, the
  per-status breakdown, and the dirty flag are all computed by selectors during
  render, never stored separately, so they stay accurate after every edit.
