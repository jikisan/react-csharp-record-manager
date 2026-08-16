export const EDITABLE_FIELDS = [
  "name",
  "category",
  "status",
  "description",
];

export const initialState = {
  records: [],
  loadStatus: "loading",
  loadError: null,
  selectedId: null,
  draft: null,
  saving: false,
  saveError: null,
};

export function pickEditable(record) {
  return Object.fromEntries(EDITABLE_FIELDS.map((f) => [f, record[f]]));
}
