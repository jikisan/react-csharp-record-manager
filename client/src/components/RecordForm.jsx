const STATUS_OPTIONS = ["Active", "On Hold", "Completed"];

// Controlled edit form for the selected record. `draft` holds the live input
// values; `onFieldChange`/`onSave` report intent upward. The component owns no
// state — every input is driven by props, which is what makes them controlled.
export default function RecordForm({
  record,
  draft,
  dirty,
  saving,
  saveError,
  onFieldChange,
  onSave,
}) {
  return (
    <form
      className="detail-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <h2>Edit record #{record.id}</h2>

      <label className="field">
        <span>Name</span>
        <input
          type="text"
          value={draft.name}
          onChange={(e) => onFieldChange("name", e.target.value)}
        />
      </label>

      <label className="field">
        <span>Category</span>
        <input
          type="text"
          value={draft.category}
          onChange={(e) => onFieldChange("category", e.target.value)}
        />
      </label>

      <label className="field">
        <span>Status</span>
        <select
          value={draft.status}
          onChange={(e) => onFieldChange("status", e.target.value)}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Description</span>
        <textarea
          rows={4}
          value={draft.description}
          onChange={(e) => onFieldChange("description", e.target.value)}
        />
      </label>

      <div className="detail-actions">
        <button type="submit" disabled={!dirty || saving}>
          {saving ? "Saving…" : "Save"}
        </button>
        {dirty && !saving && <span className="muted">Unsaved changes</span>}
        {saveError && <span className="error">{saveError}</span>}
      </div>
    </form>
  );
}
