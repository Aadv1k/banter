class MemoryStore {
  constructor() {
    this.sessions = {};
  }

  // Save session data to the store
  store(sessionId, sessionData) {
    this.sessions[sessionId] = sessionData;
  }

  // Retrieve session data from the store
  get(sessionId) {
    return this.sessions[sessionId];
  }

  dump() {
    return this.sessions;
  }

  // Remove session data from the store
  rm(sessionId) {
    delete this.sessions[sessionId];
  }
}

module.exports = MemoryStore;
