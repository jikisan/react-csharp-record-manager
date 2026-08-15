import { useEffect, useMemo, useState } from "react";
import { fetchRecords, updateRecord } from "./api";
import "./App.css";

// The editable fields, in one place so the detail form and the dirty-check
// stay in sync. `id` is intentionally not editable.
const EDITABLE_FIELDS = ["name", "category", "status", "description"];

export default function App() {
  // --- Server-owned state -------------------------------------------------
  const [records, setRecords] = useState([]); // the list, treated as immutable
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // --- UI-owned state -----------------------------------------------------
  const [selectedId, setSelectedId] = useState(null); // which row is selected
  const [draft, setDraft] = useState(null); // controlled-input values for the form
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Load records once, when the app mounts.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchRecords();
        if (!cancelled) setRecords(data);
      } catch (err) {
        if (!cancelled) setLoadError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // The currently selected record, looked up from the list (not stored twice).
  const selectedRecord = useMemo(
    () => records.find((r) => r.id === selectedId) ?? null,
    [records, selectedId]
  );

  // Selecting a row copies its values into the editable draft.
  function handleSelect(record) {
    setSelectedId(record.id);
    setSaveError(null);
    setDraft({
      name: record.name,
      category: record.category,
      status: record.status,
      description: record.description,
    });
  }

  // Every keystroke updates the draft immutably — this is what makes the
  // inputs "controlled".
  function handleFieldChange(field, value) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  // Has the draft diverged from the saved record? Drives the Save button.
  const isDirty = useMemo(() => {
    if (!selectedRecord || !draft) return false;
    return EDITABLE_FIELDS.some((f) => draft[f] !== selectedRecord[f]);
  }, [draft, selectedRecord]);

  // Save: PUT the draft, then replace that record in the list immutably with
  // whatever the server echoes back.
  async function handleSave() {
    if (!selectedRecord || !isDirty) return;
    setSaving(true);
    setSaveError(null);
    try {
      const saved = await updateRecord(selectedRecord.id, draft);
      setRecords((prev) => prev.map((r) => (r.id === saved.id ? saved : r)));
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // --- Derived output: computed from current state on every render --------
  const totalRecords = records.length;
  const selectedCount = selectedId === null ? 0 : 1;
  const statusCounts = useMemo(() => {
    const counts = {};
    for (const r of records) {
      counts[r.status] = (counts[r.status] ?? 0) + 1;
    }
    return counts;
  }, [records]);

  return (
    <div className="app">
      <header className="app__header">
        <h1>Record Manager</h1>
      </header>

      {/* Derived summary bar — recalculated from state, never stored */}
      <section className="summary" aria-label="Summary">
        <div className="summary__stat">
          <span className="summary__value">{totalRecords}</span>
          <span className="summary__label">Total records</span>
        </div>
        <div className="summary__stat">
          <span className="summary__value">{selectedCount}</span>
          <span className="summary__label">Selected</span>
        </div>
        <div className="summary__group">
          <span className="summary__label">By status</span>
          <div className="summary__chips">
            {Object.entries(statusCounts).map(([status, count]) => (
              <span key={status} className="chip">
                {status}: <strong>{count}</strong>
              </span>
            ))}
          </div>
        </div>
      </section>

      <main className="layout">
        {/* ---- Record list ---- */}
        <section className="list-panel" aria-label="Records">
          {loading && <p className="muted">Loading records…</p>}
          {loadError && <p className="error">{loadError}</p>}
          {!loading && !loadError && (
            <div className="table-scroll">
              <table className="records-table">
                <thead>
                  <tr>
                    <th className="col-id">ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr
                      key={record.id}
                      className={record.id === selectedId ? "is-selected" : ""}
                      onClick={() => handleSelect(record)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelect(record);
                        }
                      }}
                    >
                      <td className="col-id">{record.id}</td>
                      <td>{record.name}</td>
                      <td>{record.category}</td>
                      <td>
                        <span className={`status status--${record.status.replace(/\s+/g, "-").toLowerCase()}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ---- Detail / edit panel ---- */}
        <section className="detail-panel" aria-label="Detail">
          {!selectedRecord ? (
            <p className="muted detail-empty">Select a record to view and edit its details.</p>
          ) : (
            <form
              className="detail-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <h2>Edit record #{selectedRecord.id}</h2>

              <label className="field">
                <span>Name</span>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Category</span>
                <input
                  type="text"
                  value={draft.category}
                  onChange={(e) => handleFieldChange("category", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Status</span>
                <select
                  value={draft.status}
                  onChange={(e) => handleFieldChange("status", e.target.value)}
                >
                  <option>Active</option>
                  <option>On Hold</option>
                  <option>Completed</option>
                </select>
              </label>

              <label className="field">
                <span>Description</span>
                <textarea
                  rows={4}
                  value={draft.description}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                />
              </label>

              <div className="detail-actions">
                <button type="submit" disabled={!isDirty || saving}>
                  {saving ? "Saving…" : "Save"}
                </button>
                {isDirty && !saving && <span className="muted">Unsaved changes</span>}
                {saveError && <span className="error">{saveError}</span>}
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
