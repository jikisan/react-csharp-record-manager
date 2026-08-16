import { useCallback, useMemo, useState } from "react";
import { isDirty } from "../lib/derive";

const EDITABLE_FIELDS = ["name", "category", "status", "description"];

function pickEditable(record) {
  return Object.fromEntries(EDITABLE_FIELDS.map((f) => [f, record[f]]));
}

export function useRecordEditor(records, saveRecord) {
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const selectedRecord = useMemo(
    () => records.find((r) => r.id === selectedId) ?? null,
    [records, selectedId]
  );

  const select = useCallback((record) => {
    setSelectedId(record.id);
    setSaveError(null);
    setDraft(pickEditable(record));
  }, []);

  const changeField = useCallback((field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }, []);

  const dirty = useMemo(
    () => isDirty(draft, selectedRecord, EDITABLE_FIELDS),
    [draft, selectedRecord]
  );

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
