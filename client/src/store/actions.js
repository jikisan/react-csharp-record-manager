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

export const loadStarted = () => ({ type: ActionType.LOAD_STARTED });
export const loadSucceeded = (records) => ({ type: ActionType.LOAD_SUCCEEDED, records });
export const loadFailed = (error) => ({ type: ActionType.LOAD_FAILED, error });
export const recordSelected = (record) => ({ type: ActionType.RECORD_SELECTED, record });
export const fieldChanged = (field, value) => ({ type: ActionType.FIELD_CHANGED, field, value });
export const saveStarted = () => ({ type: ActionType.SAVE_STARTED });
export const saveSucceeded = (record) => ({ type: ActionType.SAVE_SUCCEEDED, record });
export const saveFailed = (error) => ({ type: ActionType.SAVE_FAILED, error });
