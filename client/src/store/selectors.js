import { EDITABLE_FIELDS } from "./state";

export function selectSelectedRecord(state) {
  return state.records.find((r) => r.id === state.selectedId) ?? null;
}

export function selectSelectedCount(state) {
  return state.selectedId === null ? 0 : 1;
}

export function selectStatusCounts(state) {
  const counts = {};
  for (const r of state.records) {
    counts[r.status] = (counts[r.status] ?? 0) + 1;
  }
  return counts;
}

export function selectIsDirty(state) {
  const record = selectSelectedRecord(state);
  if (!state.draft || !record) return false;
  return EDITABLE_FIELDS.some((f) => state.draft[f] !== record[f]);
}
