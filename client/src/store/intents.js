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

export function createIntents(dispatch, service, getState) {
  return {
    async load() {
      dispatch(loadStarted());
      try {
        const records = await service.getAll();
        dispatch(loadSucceeded(records));
      } catch (err) {
        dispatch(loadFailed(err.message));
      }
    },

    select(record) {
      dispatch(recordSelected(record));
    },

    changeField(field, value) {
      dispatch(fieldChanged(field, value));
    },

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
