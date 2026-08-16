// Derived summary bar — every value is computed by the caller from current
// state and passed in, never stored. This component only renders.
export default function SummaryBar({ total, selectedCount, statusCounts }) {
  return (
    <section className="summary" aria-label="Summary">
      <div className="summary__stat">
        <span className="summary__value">{total}</span>
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
  );
}
