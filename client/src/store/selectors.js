import { EDITABLE_FIELDS } from "./state";

// Selectors: pure functions from state to derived values.
//
// This is where the "derived output must always be accurate" requirement is
// satisfied structurally. None of these values live in state; they are recomputed
// from it on demand, so they are correct by construction. Being pure, they are
// also directly unit-testable without React.

/**
 * @param {import("./state").AppState} state
 * @returns {import("../services/RecordService.js").Record | null}
 */
export function selectSelectedRecord(state) {
  return state.records.find((r) => r.id === state.selectedId) ?? null;
}

/**
 * Selected-record count for the summary: exactly 1 or 0.
 * @param {import("./state").AppState} state
 * @returns {number}
 */
export function selectSelectedCount(state) {
  return state.selectedId === null ? 0 : 1;
}

/**
 * Records grouped by status: { [status]: count }.
 * @param {import("./state").AppState} state
 * @returns {Record<string, number>}
 */
export function selectStatusCounts(state) {
  const counts = {};
  for (const r of state.records) {
    counts[r.status] = (counts[r.status] ?? 0) + 1;
  }
  return counts;
}

/**
 * Has the draft diverged from the saved record on any editable field? Drives the
 * Save button's enabled state.
 * @param {import("./state").AppState} state
 * @returns {boolean}
 */
export function selectIsDirty(state) {
  const record = selectSelectedRecord(state);
  if (!state.draft || !record) return false;
  return EDITABLE_FIELDS.some((f) => state.draft[f] !== record[f]);
}
