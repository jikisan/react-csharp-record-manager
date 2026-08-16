// Service layer.
//
// `RecordService` is the *interface*: the contract the rest of the app depends
// on. Nothing above this line knows how records are fetched or stored — only
// that some object with `getAll` and `update` exists. `HttpRecordService` is the
// one concrete implementation, talking to the C# Minimal API.
//
// This is deliberate dependency inversion: the store depends on the abstract
// contract, and the concrete transport is injected at the edge (StoreProvider).
// Swapping in a fake for tests, or a different backend, touches nothing else.

/**
 * A record as returned by the API.
 * @typedef {Object} Record
 * @property {number} id
 * @property {string} name
 * @property {string} category
 * @property {string} status
 * @property {string} description
 */

/**
 * The subset of a record the UI is allowed to edit.
 * @typedef {Object} EditableFields
 * @property {string} name
 * @property {string} category
 * @property {string} status
 * @property {string} description
 */

/**
 * Contract for record persistence. JavaScript has no `interface` keyword, so the
 * contract is expressed as an abstract base class whose methods throw until
 * implemented — plus the JSDoc types above, which give editors real
 * type-checking with zero added packages.
 * @abstract
 */
export class RecordService {
  /**
   * Load every record.
   * @returns {Promise<Record[]>}
   * @abstract
   */
  // eslint-disable-next-line no-unused-vars
  async getAll() {
    throw new Error("RecordService.getAll is not implemented");
  }

  /**
   * Persist an edit and return the server's echoed record.
   * @param {number} id
   * @param {EditableFields} fields
   * @returns {Promise<Record>}
   * @abstract
   */
  // eslint-disable-next-line no-unused-vars
  async update(id, fields) {
    throw new Error("RecordService.update is not implemented");
  }
}

/**
 * HTTP implementation backed by the C# Minimal API.
 *
 * The backend runs on http://localhost:5105 (see
 * server/Properties/launchSettings.json) and permits this origin via CORS.
 * @implements {RecordService}
 */
export class HttpRecordService extends RecordService {
  /** @param {string} [baseUrl] */
  constructor(baseUrl = "http://localhost:5105") {
    super();
    this.baseUrl = baseUrl;
  }

  /** @returns {Promise<Record[]>} */
  async getAll() {
    const res = await fetch(`${this.baseUrl}/api/records`);
    if (!res.ok) throw new Error(`Failed to load records (${res.status})`);
    return res.json();
  }

  /**
   * @param {number} id
   * @param {EditableFields} fields
   * @returns {Promise<Record>}
   */
  async update(id, fields) {
    const res = await fetch(`${this.baseUrl}/api/records/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    if (!res.ok) throw new Error(`Failed to save record ${id} (${res.status})`);
    return res.json();
  }
}
