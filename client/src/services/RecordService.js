export class RecordService {
  async getAll() {
    throw new Error("RecordService.getAll is not implemented");
  }

  async update(id, fields) {
    throw new Error("RecordService.update is not implemented");
  }
}

export class HttpRecordService extends RecordService {
  constructor(baseUrl = "http://localhost:5105") {
    super();
    this.baseUrl = baseUrl;
  }

  async getAll() {
    const res = await fetch(`${this.baseUrl}/api/records`);
    if (!res.ok) throw new Error(`Failed to load records (${res.status})`);
    return res.json();
  }

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
