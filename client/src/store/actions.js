// Action definitions — the "Intent" vocabulary of the MVI loop.
//
// Every state change in the app is expressed as one of these plain, serializable
// actions. The reducer is the only thing that interprets them; components and
// intents only ever *create* them. That indirection is what makes the whole
// state machine inspectable and testable without React.

export const ActionType = Object.freeze({
  LOAD_STARTED: "LOAD_STARTED",
  LOAD_SUCCEEDED: "LOAD_SUCCEEDED",
  LOAD_FAILED: "LOAD_FAILED",
  RECORD_SELECTED: "RECORD_SELECTED",
  FIELD_CHANGED: "FIELD_CHANGED",
  SAVE_STARTED: "SAVE_STARTED",
  SAVE_SUCCEEDED: "SAVE_SUCCEEDED",
  SAVE_FAILED: "SAVE_FAILED",
});

/**
 * @typedef {import("../services/RecordService.js").Record} Record
 * @typedef {import("../services/RecordService.js").EditableFields} EditableFields
 */

/**
 * The discriminated union of every action the reducer understands. Modeled in
 * JSDoc so editors flag an unhandled or misshaped action at author time.
 * @typedef {(
 *   | { type: "LOAD_STARTED" }
 *   | { type: "LOAD_SUCCEEDED", records: Record[] }
 *   | { type: "LOAD_FAILED", error: string }
 *   | { type: "RECORD_SELECTED", record: Record }
 *   | { type: "FIELD_CHANGED", field: keyof EditableFields, value: string }
 *   | { type: "SAVE_STARTED" }
 *   | { type: "SAVE_SUCCEEDED", record: Record }
 *   | { type: "SAVE_FAILED", error: string }
 * )} Action
 */

// Action creators. Trivial here, but they keep action shapes in one place and
// give intents/components a typed vocabulary instead of raw object literals.
export const loadStarted = () => ({ type: ActionType.LOAD_STARTED });
export const loadSucceeded = (records) => ({ type: ActionType.LOAD_SUCCEEDED, records });
export const loadFailed = (error) => ({ type: ActionType.LOAD_FAILED, error });
export const recordSelected = (record) => ({ type: ActionType.RECORD_SELECTED, record });
export const fieldChanged = (field, value) => ({ type: ActionType.FIELD_CHANGED, field, value });
export const saveStarted = () => ({ type: ActionType.SAVE_STARTED });
export const saveSucceeded = (record) => ({ type: ActionType.SAVE_SUCCEEDED, record });
export const saveFailed = (error) => ({ type: ActionType.SAVE_FAILED, error });
