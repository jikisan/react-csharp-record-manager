// Transport layer: a thin wrapper around the C# Minimal API.
// The backend runs on http://localhost:5105 (see server/Properties/launchSettings.json)
// and permits this origin via CORS. Nothing here knows about React or UI state.
const BASE_URL = "http://localhost:5105";

// Load every record. Called once on startup.
export async function fetchRecords() {
  const res = await fetch(`${BASE_URL}/api/records`);
  if (!res.ok) throw new Error(`Failed to load records (${res.status})`);
  return res.json();
}

// Persist an edit. `fields` is the set of editable values for the record.
// Returns the saved record echoed back by the server.
export async function updateRecord(id, fields) {
  const res = await fetch(`${BASE_URL}/api/records/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  if (!res.ok) throw new Error(`Failed to save record ${id} (${res.status})`);
  return res.json();
}
