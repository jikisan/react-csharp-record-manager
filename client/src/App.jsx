import { useEffect } from "react";
import { useAppState, useIntents } from "./store/StoreProvider";
import {
  selectSelectedRecord,
  selectSelectedCount,
  selectStatusCounts,
  selectIsDirty,
} from "./store/selectors";
import SummaryBar from "./components/SummaryBar";
import RecordTable from "./components/RecordTable";
import RecordForm from "./components/RecordForm";
import "./App.css";

// App is the View/container: it reads derived slices out of the store via
// selectors and hands the presentational components exactly the props they need,
// wiring their callbacks to intents. It holds no state and computes nothing
// itself — the store owns state, selectors own derivation, intents own effects.
export default function App() {
  const intents = useIntents();

  // Kick off the one-time load. StrictMode double-invokes this in dev; the
  // load intent is idempotent (it just refetches), so that's harmless.
  useEffect(() => {
    intents.load();
  }, [intents]);

  const records = useAppState((s) => s.records);
  const loadStatus = useAppState((s) => s.loadStatus);
  const loadError = useAppState((s) => s.loadError);
  const selectedId = useAppState((s) => s.selectedId);
  const draft = useAppState((s) => s.draft);
  const saving = useAppState((s) => s.saving);
  const saveError = useAppState((s) => s.saveError);

  const selectedRecord = useAppState(selectSelectedRecord);
  const selectedCount = useAppState(selectSelectedCount);
  const statusCounts = useAppState(selectStatusCounts);
  const dirty = useAppState(selectIsDirty);

  return (
    <div className="app">
      <header className="app__header">
        <h1>Record Manager</h1>
      </header>

      <SummaryBar
        total={records.length}
        selectedCount={selectedCount}
        statusCounts={statusCounts}
      />

      <main className="layout">
        <section className="list-panel" aria-label="Records">
          {loadStatus === "loading" && <p className="muted">Loading records…</p>}
          {loadStatus === "error" && <p className="error">{loadError}</p>}
          {loadStatus === "ready" && (
            <RecordTable
              records={records}
              selectedId={selectedId}
              onSelect={intents.select}
            />
          )}
        </section>

        <section className="detail-panel" aria-label="Detail">
          {!selectedRecord ? (
            <p className="muted detail-empty">
              Select a record to view and edit its details.
            </p>
          ) : (
            <RecordForm
              record={selectedRecord}
              draft={draft}
              dirty={dirty}
              saving={saving}
              saveError={saveError}
              onFieldChange={intents.changeField}
              onSave={intents.save}
            />
          )}
        </section>
      </main>
    </div>
  );
}
