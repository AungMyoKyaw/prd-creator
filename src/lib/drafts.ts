import { PrdInputs } from './prompt';
import { IngestInsight } from './ingest';

const STORAGE_KEY = 'prd-studio-drafts/v1';
const MAX_DRAFTS = 12;

export interface StoredDraft {
  id: string;
  title: string;
  createdAt: string;
  model: string;
  inputs: PrdInputs;
  markdown: string;
  ingest?: {
    insight: IngestInsight | null;
    fileName?: string;
    fileSize?: number;
  };
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

export function loadDrafts(): StoredDraft[] {
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

export function saveDraft(draft: StoredDraft): StoredDraft[] {
  const storage = getStorage();
  if (!storage) {
    return [];
  }
  const existing = loadDrafts().filter((item) => item.id !== draft.id);
  const next = [draft, ...existing].slice(0, MAX_DRAFTS);
  storage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function deleteDraft(id: string): StoredDraft[] {
  const storage = getStorage();
  if (!storage) {
    return [];
  }
  const next = loadDrafts().filter((draft) => draft.id !== id);
  storage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
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
