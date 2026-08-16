export function computeStatusCounts(records) {
  const counts = {};
  for (const r of records) {
    counts[r.status] = (counts[r.status] ?? 0) + 1;
  }
  return counts;
}

export function isDirty(draft, record, fields) {
  if (!draft || !record) return false;
  return fields.some((f) => draft[f] !== record[f]);
}
