function statusModifier(status) {
  return status.replace(/\s+/g, "-").toLowerCase();
}

export default function RecordTable({ records, selectedId, onSelect }) {
  return (
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
              onClick={() => onSelect(record)}
              tabIndex={0}
              aria-selected={record.id === selectedId}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(record);
                }
              }}
            >
              <td className="col-id">{record.id}</td>
              <td>{record.name}</td>
              <td>{record.category}</td>
              <td>
                <span className={`status status--${statusModifier(record.status)}`}>
                  {record.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
