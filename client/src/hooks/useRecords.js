import { useCallback, useEffect, useState } from "react";
import { fetchRecords, updateRecord } from "../api/records";

// Owns the server-derived record state: the list, its load lifecycle, and
// persistence. Components consume the data and call `saveRecord`; they never
// touch the transport layer directly. This is the one place that changes if the
// API shape or caching strategy changes.
export function useRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

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

  // Persist an edit, then replace that record in the list immutably with
  // whatever the server echoes back. Throws on failure so callers can surface
  // their own saving/error UI.
  const saveRecord = useCallback(async (id, fields) => {
    const saved = await updateRecord(id, fields);
    setRecords((prev) => prev.map((r) => (r.id === saved.id ? saved : r)));
    return saved;
  }, []);

  return { records, loading, loadError, saveRecord };
}
