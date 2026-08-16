const BASE_URL = "http://localhost:5105";

export async function fetchRecords() {
  const res = await fetch(`${BASE_URL}/api/records`);
  if (!res.ok) throw new Error(`Failed to load records (${res.status})`);
  return res.json();
}

export async function updateRecord(id, fields) {
  const res = await fetch(`${BASE_URL}/api/records/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  if (!res.ok) throw new Error(`Failed to save record ${id} (${res.status})`);
  return res.json();
}
