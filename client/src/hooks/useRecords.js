import { useCallback, useEffect, useState } from "react";
import { fetchRecords, updateRecord } from "../api/records";

export function useRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

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

  const saveRecord = useCallback(async (id, fields) => {
    const saved = await updateRecord(id, fields);
    setRecords((prev) => prev.map((r) => (r.id === saved.id ? saved : r)));
    return saved;
  }, []);

  return { records, loading, loadError, saveRecord };
}
