// IndexedDBAdapter.js
// IndexedDBへの基本的なアクセスを提供するアダプタクラス

class IndexedDBAdapter {
    constructor(dbName = 'gemini-fe4lc', version = 1) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
    }

    async open(stores = [{ name: 'settings', options: { keyPath: 'key' } }]) {
        if (this.db) return this.db;
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                stores.forEach(store => {
                    if (!db.objectStoreNames.contains(store.name)) {
                        db.createObjectStore(store.name, store.options);
                    }
                });
            };
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    _getStore(storeName, mode = 'readonly') {
        if (!this.db) throw new Error('DB not opened');
        return this.db.transaction([storeName], mode).objectStore(storeName);
    }

    async get(storeName, key) {
        await this.open();
        return new Promise((resolve, reject) => {
            const store = this._getStore(storeName);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async put(storeName, value) {
        await this.open();
        return new Promise((resolve, reject) => {
            const store = this._getStore(storeName, 'readwrite');
            const request = store.put(value);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, key) {
        await this.open();
        return new Promise((resolve, reject) => {
            const store = this._getStore(storeName, 'readwrite');
            const request = store.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async clear(storeName) {
        await this.open();
        return new Promise((resolve, reject) => {
            const store = this._getStore(storeName, 'readwrite');
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// export default IndexedDBAdapter; 