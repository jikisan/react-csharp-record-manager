import {
  loadStarted,
  loadSucceeded,
  loadFailed,
  recordSelected,
  fieldChanged,
  saveStarted,
  saveSucceeded,
  saveFailed,
} from "./actions";
import { selectSelectedRecord, selectIsDirty } from "./selectors";

// Intents: the side-effecting half of the MVI loop.
//
// The reducer is pure, so anything asynchronous — talking to the service,
// sequencing started/succeeded/failed actions — lives here instead. Each intent
// is a plain async function that reads state via `getState`, calls the injected
// `service`, and dispatches actions. This is the seam a library like redux-thunk
// would occupy; it's a dozen lines because the app doesn't need more.
//
// `service` is a RecordService (the interface), never a concrete class — intents
// have no idea HTTP is involved.

/**
 * @param {(a: import("./actions").Action) => void} dispatch
 * @param {import("../services/RecordService.js").RecordService} service
 * @param {() => import("./state").AppState} getState
 */
export function createIntents(dispatch, service, getState) {
  return {
    /** Load the list. Called once on startup. */
    async load() {
      dispatch(loadStarted());
      try {
        const records = await service.getAll();
        dispatch(loadSucceeded(records));
      } catch (err) {
        dispatch(loadFailed(err.message));
      }
    },

    /** @param {import("../services/RecordService.js").Record} record */
    select(record) {
      dispatch(recordSelected(record));
    },

    /**
     * @param {string} field
     * @param {string} value
     */
    changeField(field, value) {
      dispatch(fieldChanged(field, value));
    },

    /** Persist the current draft, guarding against no-op writes. */
    async save() {
      const state = getState();
      const record = selectSelectedRecord(state);
      if (!record || !selectIsDirty(state)) return;
      dispatch(saveStarted());
      try {
        const saved = await service.update(record.id, state.draft);
        dispatch(saveSucceeded(saved));
      } catch (err) {
        dispatch(saveFailed(err.message));
      }
    },
  };
}

/** @typedef {ReturnType<typeof createIntents>} Intents */
