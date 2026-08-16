import { useCallback, useMemo, useState } from "react";
import { isDirty } from "../lib/derive";

// The editable fields, in one place so the draft shape and the dirty-check stay
// in sync. `id` is intentionally not editable.
const EDITABLE_FIELDS = ["name", "category", "status", "description"];

// Copy just the editable fields off a record into a fresh draft object.
function pickEditable(record) {
  return Object.fromEntries(EDITABLE_FIELDS.map((f) => [f, record[f]]));
}

// Owns the "editing session": which row is selected, the controlled-input
// draft, whether it is dirty, and the save lifecycle. Given the current list
// and a persistence function, it exposes everything the UI needs to view and
// edit one record. No transport or rendering concerns live here.
export function useRecordEditor(records, saveRecord) {
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // The selected record, looked up from the list (not stored twice).
  const selectedRecord = useMemo(
    () => records.find((r) => r.id === selectedId) ?? null,
    [records, selectedId]
  );

  // Selecting a row copies its values into the editable draft.
  const select = useCallback((record) => {
    setSelectedId(record.id);
    setSaveError(null);
    setDraft(pickEditable(record));
  }, []);

  // Every keystroke updates the draft immutably.
  const changeField = useCallback((field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Has the draft diverged from the saved record? Drives the Save button.
  const dirty = useMemo(
    () => isDirty(draft, selectedRecord, EDITABLE_FIELDS),
    [draft, selectedRecord]
  );

  // Persist the draft; own the saving/error UI state around it.
  const save = useCallback(async () => {
    if (!selectedRecord || !dirty) return;
    setSaving(true);
    setSaveError(null);
    try {
      await saveRecord(selectedRecord.id, draft);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }, [selectedRecord, dirty, draft, saveRecord]);

  return {
    selectedId,
    selectedRecord,
    draft,
    dirty,
    saving,
    saveError,
    select,
    changeField,
    save,
  };
}
