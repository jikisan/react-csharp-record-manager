import { ActionType } from "./actions";
import { pickEditable } from "./state";

// The reducer: a pure function (AppState, Action) -> AppState.
//
// This is the heart of the architecture. It is the *only* place state
// transitions are defined, it has no I/O, no React, and no async — so it can be
// unit-tested with plain objects in and plain objects out. Every branch returns
// a new object; nothing is mutated in place.

/**
 * @param {import("./state").AppState} state
 * @param {import("./actions").Action} action
 * @returns {import("./state").AppState}
 */
export function reducer(state, action) {
  switch (action.type) {
    case ActionType.LOAD_STARTED:
      return { ...state, loadStatus: "loading", loadError: null };

    case ActionType.LOAD_SUCCEEDED:
      return { ...state, loadStatus: "ready", records: action.records };

    case ActionType.LOAD_FAILED:
      return { ...state, loadStatus: "error", loadError: action.error };

    case ActionType.RECORD_SELECTED:
      return {
        ...state,
        selectedId: action.record.id,
        draft: pickEditable(action.record),
        saveError: null,
      };

    case ActionType.FIELD_CHANGED:
      // Guard: ignore edits when nothing is selected. Immutable draft update.
      if (!state.draft) return state;
      return {
        ...state,
        draft: { ...state.draft, [action.field]: action.value },
      };

    case ActionType.SAVE_STARTED:
      return { ...state, saving: true, saveError: null };

    case ActionType.SAVE_SUCCEEDED:
      // Replace the saved record immutably with the server's echoed copy.
      return {
        ...state,
        saving: false,
        records: state.records.map((r) =>
          r.id === action.record.id ? action.record : r
        ),
      };

    case ActionType.SAVE_FAILED:
      return { ...state, saving: false, saveError: action.error };

    default:
      return state;
  }
}
