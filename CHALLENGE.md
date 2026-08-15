# Coding Challenge

## Rules

- Complete all work in VS Code, including running and testing via the built-in terminal.
- Frontend: Use React (no extra libraries/packages beyond what comes with your React setup).
- Backend: Use C# (.NET Minimal API) (no extra NuGet packages beyond the project template).
- No database, no external services/APIs, and no external data files.
- All starting data must be hard-coded in the C# backend and stored in-memory.

## Objective

Build a small "record manager" app that demonstrates real-world full-stack fundamentals: list rendering, row selection, detail views, controlled inputs, immutable updates, derived UI state, and basic API communication between React and a C# backend.

## Steps

### 1) Project Setup

- Create a folder named `react-csharp-record-manager`.
- Create a React app for the client (Vite/CRA). No added dependencies.
- Create a .NET Minimal API project for the server. No added dependencies.

### 2) Create In-Memory Data (C#)

In the C# API, create an initial list named `initialRecords` with at least 5 records. Each record must include:

- `id` (number)
- `name` (string)
- `category` (string)
- `status` (string)
- `description` (string)

Example records may represent items such as projects, customers, employees, or tasks.

### 3) Build the UI (React)

Your React app must include:

- A title: **Record Manager**
- A scrolling list of records
- At least 3 visible columns of data in the list
- A way to select a row from the list
- A detail screen or detail panel for the selected record
- Editable fields for the selected record using controlled inputs
- A Save button to update the record

### 4) Wire Up API Calls

- React must load records from the C# API on startup.
- Select row → display that record's details in the detail screen
- Edit details → update local controlled input state
- Save changes → PUT or PATCH to API, then update UI
- The updated values must remain in memory on the server while the app is running

### 5) Add Derived Output

Display these values computed from current UI state, not stored separately:

- Total number of records
- Number of selected records: 1 or 0
- Number of records by status, or another useful grouped summary based on your chosen data

## Verification Criteria

- Uses React state correctly (no direct mutation of arrays/objects)
- Controlled inputs work as expected
- List rendering uses stable key values
- The list is scrollable and clearly displays multiple columns
- Selecting a row shows the correct record details
- Editing and saving updates the in-memory data through the API
- Derived counts or summaries are computed from current state and always accurate
