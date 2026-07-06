// Offline queue system using IndexedDB

class OfflineQueue {
  constructor() {
    this.dbName = 'atlas-offline';
    this.storeName = 'queue';
  }

  async init() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, 1);
      req.onupgradeneeded = (e) => {
        e.target.result.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = reject;
    });
  }

  async enqueue(action) {
    const db = await this.init();
    const tx = db.transaction(this.storeName, 'readwrite');
    tx.objectStore(this.storeName).add({
      ...action,
      timestamp: Date.now(),
    });
    return new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = reject;
    });
  }

  async processQueue(apiClient) {
    const db = await this.init();
    const tx = db.transaction(this.storeName, 'readonly');
    const store = tx.objectStore(this.storeName);
    const items = await new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = reject;
    });

    for (const item of items) {
      try {
        await apiClient.request(item.method, item.path, item.body);
        const deleteTx = db.transaction(this.storeName, 'readwrite');
        deleteTx.objectStore(this.storeName).delete(item.id);
        await new Promise((resolve) => { deleteTx.oncomplete = resolve; });
      } catch {
        // Will retry on next sync
      }
    }
  }
}

const offlineQueue = new OfflineQueue();

// Register sync when online
window.addEventListener('online', async () => {
  const { default: api } = await import('./api.js');
  await offlineQueue.processQueue(api);
});

export default offlineQueue;
