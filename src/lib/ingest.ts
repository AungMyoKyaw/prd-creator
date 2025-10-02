type UnknownRecord = Record<string, unknown>;

export interface IngestInsight {
  rawText: string;
  json: UnknownRecord | UnknownRecord[] | null;
  fileCount: number;
  moduleNames: string[];
  languageStats: Array<{ language: string; count: number }>;
  keyInsights: string[];
  repoName?: string;
  lastUpdated?: string;
}

const LANGUAGE_BY_EXTENSION: Record<string, string> = {
  ts: 'TypeScript',
  tsx: 'TypeScript',
  js: 'JavaScript',
  jsx: 'JavaScript',
  py: 'Python',
  rb: 'Ruby',
  go: 'Go',
  rs: 'Rust',
  java: 'Java',
  kt: 'Kotlin',
  swift: 'Swift',
  cs: 'C#',
  cpp: 'C++',
  c: 'C',
  php: 'PHP',
  css: 'CSS',
  scss: 'SCSS',
  html: 'HTML',
  md: 'Markdown',
  json: 'JSON',
  yml: 'YAML',
  yaml: 'YAML'
};

function safeParse(raw: string): UnknownRecord | UnknownRecord[] | null {
  try {
    return JSON.parse(raw) as UnknownRecord | UnknownRecord[];
  } catch {
    return null;
  }
}

function collectFilePaths(structure: unknown): string[] {
  if (!structure) return [];

  const queue: unknown[] = [structure];
  const paths: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;

    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }

    if (typeof current === 'object') {
      const record = current as UnknownRecord;
      if (typeof record.path === 'string') {
        paths.push(record.path);
      }
      if (typeof record.filePath === 'string') {
        paths.push(record.filePath);
      }
      if (
        typeof record.name === 'string' &&
        typeof record.type === 'string' &&
        record.type === 'file'
      ) {
        paths.push(record.name);
      }
      Object.values(record).forEach((value) => {
        if (typeof value === 'object' && value) {
          queue.push(value);
        }
      });
    }
  }

  return Array.from(new Set(paths));
}

function collectRepoName(structure: unknown): string | undefined {
  if (!structure) return undefined;

  if (Array.isArray(structure)) {
    for (const item of structure) {
      const name = collectRepoName(item);
      if (name) return name;
    }
    return undefined;
  }

  if (typeof structure === 'object') {
    const record = structure as UnknownRecord;
    if (typeof record.repository === 'string') return record.repository;
    if (typeof record.repo === 'string') return record.repo;
    if (typeof record.name === 'string' && typeof record.url === 'string') {
      return record.name;
    }
    if (typeof record.repository === 'object' && record.repository) {
      const nested = record.repository as UnknownRecord;
      if (typeof nested.name === 'string') return nested.name;
    }
    for (const value of Object.values(record)) {
      if (typeof value === 'object' && value) {
        const nestedName = collectRepoName(value);
        if (nestedName) return nestedName;
      }
    }
  }

  return undefined;
}

function collectLastUpdated(structure: unknown): string | undefined {
  if (!structure) return undefined;

  if (Array.isArray(structure)) {
    for (const item of structure) {
      const found = collectLastUpdated(item);
      if (found) return found;
    }
    return undefined;
  }

  if (typeof structure === 'object') {
    const record = structure as UnknownRecord;
    const candidates = [
      record.lastUpdated,
      record.updatedAt,
      record.timestamp,
      record.generated_at
    ];
    for (const candidate of candidates) {
      if (typeof candidate === 'string') {
        return candidate;
      }
    }
    for (const value of Object.values(record)) {
      if (typeof value === 'object' && value) {
        const nested = collectLastUpdated(value);
        if (nested) return nested;
      }
    }
  }

  return undefined;
}

export function analyzeGitIngest(raw: string): IngestInsight {
  const parsed = safeParse(raw);
  const filePaths = collectFilePaths(parsed ?? undefined);
  const languageCount = new Map<string, number>();

  filePaths.forEach((path) => {
    const extension = path.split('.').pop()?.toLowerCase();
    const language = extension
      ? (LANGUAGE_BY_EXTENSION[extension] ?? 'Other')
      : 'Other';
    languageCount.set(language, (languageCount.get(language) ?? 0) + 1);
  });

  const moduleNames = filePaths
    .map((path) => path.split('/')[0])
    .filter(Boolean);

  const moduleFrequency = moduleNames.reduce<Map<string, number>>(
    (acc, module) => {
      acc.set(module, (acc.get(module) ?? 0) + 1);
      return acc;
    },
    new Map()
  );

  const dominantModules = Array.from(moduleFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name]) => name)
    .filter(Boolean);

  const keyInsights: string[] = [];
  if (filePaths.length > 0) {
    keyInsights.push(`Ingest includes ${filePaths.length} tracked files.`);
  }
  if (dominantModules.length) {
    keyInsights.push(`Primary modules: ${dominantModules.join(', ')}.`);
  }
  if (languageCount.size) {
    const languageSummary = Array.from(languageCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([language, count]) => `${language} (${count})`)
      .join(', ');
    keyInsights.push(`Detected languages: ${languageSummary}.`);
  }

  return {
    rawText: raw,
    json: parsed,
    fileCount: filePaths.length,
    moduleNames: dominantModules,
    languageStats: Array.from(languageCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([language, count]) => ({ language, count })),
    keyInsights,
    repoName: collectRepoName(parsed ?? undefined),
    lastUpdated: collectLastUpdated(parsed ?? undefined)
  };
}
