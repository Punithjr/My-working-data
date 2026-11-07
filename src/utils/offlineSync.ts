// Offline IndexedDB and Sync Manager for Docket Movements and Status Updates
const DB_NAME = 'fts_offline_store';
const DB_VERSION = 1;
const STORE_NAME = 'pending_file_actions';

export interface PendingAction {
  id: string;
  type: 'MOVE_FILE' | 'UPDATE_CATEGORY' | 'STATUS_UPDATE';
  fileId: string;
  payload: any;
  timestamp: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function queueOfflineAction(action: Omit<PendingAction, 'id' | 'timestamp'>): Promise<string> {
  const id = `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const record: PendingAction = {
    ...action,
    id,
    timestamp: Date.now(),
  };

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.add(record);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    // Attempt to register Service Worker Background Sync if available
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if ('sync' in registration) {
          await (registration as any).sync.register('sync-dockets');
        }
      } catch (e) {
        // Sync registration fallback handled by online event listener
      }
    }

    return id;
  } catch (err) {
    console.error('Failed to queue offline action in IndexedDB:', err);
    return id;
  }
}

export async function getPendingOfflineActions(): Promise<PendingAction[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch (err) {
    console.error('Failed to get pending offline actions:', err);
    return [];
  }
}

export async function clearOfflineAction(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
  } catch (err) {
    console.error('Failed to clear action from IndexedDB:', err);
  }
}

export function registerOnlineSyncHandler(
  onSyncAction: (action: PendingAction) => Promise<boolean>,
  onSyncComplete?: (count: number) => void
) {
  if (typeof window === 'undefined') return;

  const triggerSync = async () => {
    if (!navigator.onLine) return;
    const actions = await getPendingOfflineActions();
    if (actions.length === 0) return;

    let syncedCount = 0;
    for (const act of actions) {
      try {
        const success = await onSyncAction(act);
        if (success) {
          await clearOfflineAction(act.id);
          syncedCount++;
        }
      } catch (e) {
        console.error('Error syncing action:', act, e);
      }
    }

    if (syncedCount > 0 && onSyncComplete) {
      onSyncComplete(syncedCount);
    }
  };

  window.addEventListener('online', triggerSync);
  // Also check immediately upon startup if online
  if (navigator.onLine) {
    setTimeout(triggerSync, 2000);
  }

  return () => {
    window.removeEventListener('online', triggerSync);
  };
}
