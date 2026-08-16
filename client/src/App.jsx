import { useMemo } from "react";
import { useRecords } from "./hooks/useRecords";
import { useRecordEditor } from "./hooks/useRecordEditor";
import { computeStatusCounts } from "./lib/derive";
import SummaryBar from "./components/SummaryBar";
import RecordTable from "./components/RecordTable";
import RecordForm from "./components/RecordForm";
import "./App.css";

// App is a thin orchestrator: useRecords owns the server data, useRecordEditor
// owns the editing session, and presentation is delegated to
// SummaryBar / RecordTable / RecordForm.
export default function App() {
  const { records, loading, loadError, saveRecord } = useRecords();
  const editor = useRecordEditor(records, saveRecord);

  // Derived output: computed from current state on every render, never stored.
  const statusCounts = useMemo(() => computeStatusCounts(records), [records]);

  return (
    <div className="app">
      <header className="app__header">
        <h1>Record Manager</h1>
      </header>

      <SummaryBar
        total={records.length}
        selectedCount={editor.selectedId === null ? 0 : 1}
        statusCounts={statusCounts}
      />

      <main className="layout">
        <section className="list-panel" aria-label="Records">
          {loading && <p className="muted">Loading records…</p>}
          {loadError && <p className="error">{loadError}</p>}
          {!loading && !loadError && (
            <RecordTable
              records={records}
              selectedId={editor.selectedId}
              onSelect={editor.select}
            />
          )}
        </section>

        <section className="detail-panel" aria-label="Detail">
          {!editor.selectedRecord ? (
            <p className="muted detail-empty">
              Select a record to view and edit its details.
            </p>
          ) : (
            <RecordForm
              record={editor.selectedRecord}
              draft={editor.draft}
              dirty={editor.dirty}
              saving={editor.saving}
              saveError={editor.saveError}
              onFieldChange={editor.changeField}
              onSave={editor.save}
            />
          )}
        </section>
      </main>
    </div>
  );
}
