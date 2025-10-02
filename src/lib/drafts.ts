import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { PrdInput } from './prd';
import { IngestInsight } from './ingest';

const STORAGE_KEY = 'prd-studio-drafts/v1';
const MAX_DRAFTS = 12;
const DB_NAME = 'prd-creator-db';
const DB_VERSION = 1;
const STORE_NAME = 'drafts';

export interface StoredDraft {
  id: string;
  title: string;
  createdAt: string;
  model: string;
  inputs: PrdInput;
  markdown: string;
  ingest?: {
    insight: IngestInsight | null;
    fileName?: string;
    fileSize?: number;
  };
}

interface PRDCreatorDB extends DBSchema {
  drafts: {
    key: string;
    value: StoredDraft;
    indexes: { 'by-date': string };
  };
}

let dbPromise: Promise<IDBPDatabase<PRDCreatorDB>> | null = null;

function getDB(): Promise<IDBPDatabase<PRDCreatorDB>> {
  if (!dbPromise) {
    dbPromise = openDB<PRDCreatorDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('by-date', 'createdAt');
        }
      }
    });
  }
  return dbPromise;
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

// Fallback to localStorage
function loadDraftsFromLocalStorage(): StoredDraft[] {
  const storage = getStorage();
  if (!storage) {
    return [];
  }
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as StoredDraft[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
}

function saveDraftsToLocalStorage(drafts: StoredDraft[]): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  storage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export async function loadDrafts(): Promise<StoredDraft[]> {
  try {
    const db = await getDB();
    const allDrafts = await db.getAll(STORE_NAME);
    // Sort by createdAt descending
    allDrafts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return allDrafts;
  } catch (error) {
    console.warn(
      'IndexedDB not available, falling back to localStorage:',
      error
    );
    return loadDraftsFromLocalStorage();
  }
}

export async function saveDraft(draft: StoredDraft): Promise<StoredDraft[]> {
  try {
    const db = await getDB();
    await db.put(STORE_NAME, draft);

    // Get all drafts and keep only MAX_DRAFTS
    const allDrafts = await db.getAll(STORE_NAME);
    allDrafts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Delete excess drafts
    if (allDrafts.length > MAX_DRAFTS) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      for (let i = MAX_DRAFTS; i < allDrafts.length; i++) {
        await tx.store.delete(allDrafts[i].id);
      }
      await tx.done;
    }

    // Also save to localStorage as backup
    const draftsForStorage = allDrafts.slice(0, MAX_DRAFTS);
    saveDraftsToLocalStorage(draftsForStorage);

    return draftsForStorage;
  } catch (error) {
    console.warn(
      'IndexedDB not available, falling back to localStorage:',
      error
    );
    const storage = getStorage();
    if (!storage) {
      return [];
    }
    const existing = loadDraftsFromLocalStorage().filter(
      (item) => item.id !== draft.id
    );
    const next = [draft, ...existing].slice(0, MAX_DRAFTS);
    saveDraftsToLocalStorage(next);
    return next;
  }
}

export async function deleteDraft(id: string): Promise<StoredDraft[]> {
  try {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
    const remaining = await db.getAll(STORE_NAME);
    remaining.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Also update localStorage
    saveDraftsToLocalStorage(remaining);

    return remaining;
  } catch (error) {
    console.warn(
      'IndexedDB not available, falling back to localStorage:',
      error
    );
    const next = loadDraftsFromLocalStorage().filter(
      (draft) => draft.id !== id
    );
    saveDraftsToLocalStorage(next);
    return next;
  }
}

export async function getDraft(id: string): Promise<StoredDraft | undefined> {
  try {
    const db = await getDB();
    return await db.get(STORE_NAME, id);
  } catch (error) {
    console.warn(
      'IndexedDB not available, falling back to localStorage:',
      error
    );
    const drafts = loadDraftsFromLocalStorage();
    return drafts.find((draft) => draft.id === id);
  }
}

// Migrate existing localStorage data to IndexedDB
export async function migrateLocalStorageToIndexedDB(): Promise<void> {
  try {
    const localDrafts = loadDraftsFromLocalStorage();
    if (localDrafts.length === 0) {
      return;
    }

    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');

    for (const draft of localDrafts) {
      const existing = await tx.store.get(draft.id);
      if (!existing) {
        await tx.store.put(draft);
      }
    }

    await tx.done;
    console.log('Successfully migrated localStorage data to IndexedDB');
  } catch (error) {
    console.warn('Failed to migrate localStorage to IndexedDB:', error);
  }
}

export function sanitizeIngestForStorage(
  ingest: IngestInsight | null,
  limit = 20_000
): IngestInsight | null {
  if (!ingest) {
    return null;
  }

  const safeRawText =
    ingest.rawText.length > limit
      ? `${ingest.rawText.slice(0, limit)}\n\n[context truncated for offline cache]`
      : ingest.rawText;

  return {
    ...ingest,
    rawText: safeRawText,
    json: null
  };
}
