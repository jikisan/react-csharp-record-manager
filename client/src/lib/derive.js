// Pure helpers for the derived UI values. Kept free of React so they can be
// reasoned about — and unit-tested — in isolation from the components.

// Count records grouped by their `status` field.
// Returns a plain object: { [status]: count }.
export function computeStatusCounts(records) {
  const counts = {};
  for (const r of records) {
    counts[r.status] = (counts[r.status] ?? 0) + 1;
  }
  return counts;
}

// Has the editable draft diverged from the saved record on any editable field?
export function isDirty(draft, record, fields) {
  if (!draft || !record) return false;
  return fields.some((f) => draft[f] !== record[f]);
}
