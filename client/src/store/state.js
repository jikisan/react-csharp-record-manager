// The Model in MVI: the complete, single source of truth for the app.
//
// Note what is *not* here. Derived values — the status counts, the selected
// record, the dirty flag — are absent by design. They are computed by selectors
// from this state, never stored, so they cannot drift out of sync. State holds
// only what can't be recomputed.

/**
 * @typedef {import("../services/RecordService.js").Record} Record
 * @typedef {import("../services/RecordService.js").EditableFields} EditableFields
 */

/**
 * @typedef {Object} AppState
 * @property {Record[]} records            The loaded list.
 * @property {"loading"|"ready"|"error"} loadStatus  Load lifecycle.
 * @property {string|null} loadError
 * @property {number|null} selectedId      Which row is selected.
 * @property {EditableFields|null} draft   Live controlled-input values.
 * @property {boolean} saving
 * @property {string|null} saveError
 */

// The editable fields, defined once so the draft shape and the dirty check can
// never disagree. `id` is intentionally excluded.
export const EDITABLE_FIELDS = /** @type {const} */ ([
  "name",
  "category",
  "status",
  "description",
]);

/** @type {AppState} */
export const initialState = {
  records: [],
  loadStatus: "loading",
  loadError: null,
  selectedId: null,
  draft: null,
  saving: false,
  saveError: null,
};

/**
 * Copy just the editable fields off a record into a fresh draft.
 * @param {Record} record
 * @returns {EditableFields}
 */
export function pickEditable(record) {
  return /** @type {EditableFields} */ (
    Object.fromEntries(EDITABLE_FIELDS.map((f) => [f, record[f]]))
  );
}
