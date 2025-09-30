'use client';

import { ChangeEvent, DragEvent, useCallback, useEffect, useMemo, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { InfoCircledIcon, MagicWandIcon, ReloadIcon } from "@radix-ui/react-icons";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MacOSWindow } from "@/components/ui/macos-window";
import { SectionCard } from "@/components/ui/section-card";
import { analyzeGitIngest, IngestInsight } from "@/lib/ingest";
import { buildPrdPrompt, PrdInputs } from "@/lib/prompt";
import { GEMINI_MODELS } from "@/lib/models";
import {
  deleteDraft,
  loadDrafts,
  sanitizeIngestForStorage,
  saveDraft,
  StoredDraft,
} from "@/lib/drafts";
import { downloadBlob, slugifyFileName } from "@/lib/download";

type WorkspaceTab = "briefing" | "repository" | "output";

const STORAGE_KEY = "prd-studio-gemini-api-key";

const defaultInputs: PrdInputs = {
  productName: "",
  productGoal: "",
  targetAudience: "",
  keyFeatures: "",
  successMetrics: "",
  constraints: "",
  tone: "detailed",
  additionalNotes: "",
};

const fieldClasses =
  "rounded-[12px] border border-white/70 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-[0_10px_28px_rgba(17,26,38,0.12)] transition focus:outline-none focus:ring-2 focus:ring-blue-400/60 dark:border-slate-800/70 dark:bg-slate-950/70 dark:text-slate-100";

function safeUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `draft-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function formatDraftTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

function markdownToPlain(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```/g, ""))
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/[*_`~]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

type DocxModule = typeof import("docx");

function buildDocxParagraphs(markdown: string, docx: DocxModule) {
  const { Paragraph, TextRun, HeadingLevel } = docx;
  const paragraphs: Array<InstanceType<DocxModule["Paragraph"]>> = [];
  const lines = markdown.split(/\n/);
  let inCode = false;

  lines.forEach((rawLine) => {
    const trimmed = rawLine.trimEnd();

    if (trimmed.startsWith("```") && !inCode) {
      inCode = true;
      return;
    }

    if (trimmed.startsWith("```") && inCode) {
      inCode = false;
      return;
    }

    if (inCode) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: rawLine, font: "Courier New" })],
        }),
      );
      return;
    }

    if (!trimmed.trim()) {
      paragraphs.push(new Paragraph({ text: "" }));
      return;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = Math.min(headingMatch[1].length, 6);
      const text = headingMatch[2];
      const candidates: Array<(typeof HeadingLevel)[keyof typeof HeadingLevel]> = [
        HeadingLevel.HEADING_1,
        HeadingLevel.HEADING_2,
        HeadingLevel.HEADING_3,
        HeadingLevel.HEADING_4,
        HeadingLevel.HEADING_5,
        HeadingLevel.HEADING_6,
      ];
      const headingLevel = candidates[level - 1] ?? HeadingLevel.HEADING_3;
      paragraphs.push(
        new Paragraph({
          text,
          heading: headingLevel,
        }),
      );
      return;
    }

    if (/^[-*+]\s+/.test(trimmed)) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace(/^[-*+]\s+/, ""),
          bullet: { level: 0 },
        }),
      );
      return;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace(/^\d+\.\s+/, ""),
          bullet: { level: 0 },
        }),
      );
      return;
    }

    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: trimmed })],
      }),
    );
  });

  return paragraphs;
}

export default function Home() {
  const [ingestInsight, setIngestInsight] = useState<IngestInsight | null>(null);
  const [ingestFileName, setIngestFileName] = useState<string>("");
  const [ingestFileSize, setIngestFileSize] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("Drop a git ingest export to begin.");
  const [ingestError, setIngestError] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [prdMarkdown, setPrdMarkdown] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [rememberKey, setRememberKey] = useState<boolean>(false);
  const [model, setModel] = useState<string>(GEMINI_MODELS[1]?.value ?? "gemini-1.5-flash-latest");
  const [inputs, setInputs] = useState<PrdInputs>(defaultInputs);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("briefing");
  const [isDragging, setIsDragging] = useState(false);
  const [drafts, setDrafts] = useState<StoredDraft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedKey = window.localStorage.getItem(STORAGE_KEY);
    if (storedKey) {
      setApiKey(storedKey);
      setRememberKey(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (rememberKey && apiKey) {
      window.localStorage.setItem(STORAGE_KEY, apiKey);
    }
    if (!rememberKey) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [apiKey, rememberKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDrafts(loadDrafts());
  }, []);

  const readableFileSize = useMemo(() => {
    if (!ingestFileSize) return "";
    const mb = ingestFileSize / (1024 * 1024);
    if (mb < 0.8) {
      const kb = ingestFileSize / 1024;
      return `${kb.toFixed(1)} KB`;
    }
    return `${mb.toFixed(2)} MB`;
  }, [ingestFileSize]);

  const activeDraft = useMemo(
    () => drafts.find((draft) => draft.id === activeDraftId) ?? null,
    [drafts, activeDraftId],
  );

  const canExport = useMemo(() => prdMarkdown.trim().length > 0, [prdMarkdown]);

  const composeFilename = useCallback(
    (extension: string) => {
      const sourceTitle = inputs.productName.trim() || activeDraft?.title || "prd";
      const slug = slugifyFileName(sourceTitle);
      const sourceDate = activeDraft?.createdAt ? new Date(activeDraft.createdAt) : new Date();
      const fallback = new Date();
      const date = Number.isNaN(sourceDate.getTime()) ? fallback : sourceDate;
      const dateLabel = date.toISOString().split("T")[0];
      return `${slug || "prd"}-${dateLabel}.${extension}`;
    },
    [activeDraft, inputs.productName],
  );

  const handleResetWorkspace = useCallback(() => {
    setIngestInsight(null);
    setIngestFileName("");
    setIngestFileSize(0);
    setStatusMessage("Workspace reset. Drop a git ingest export to begin.");
    setIngestError(null);
    setGenerationError(null);
    setExportError(null);
    setPrdMarkdown("");
    setInputs(defaultInputs);
    setActiveTab("briefing");
    setActiveDraftId(null);
  }, []);

  const handleParseFile = useCallback(async (file: File) => {
    setStatusMessage(`Parsing ${file.name}…`);
    setIngestError(null);
    setGenerationError(null);
    setExportError(null);
    try {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File is larger than 10 MB. Please provide a smaller export.");
      }
      const rawText = await file.text();
      const insight = analyzeGitIngest(rawText);
      setIngestInsight(insight);
      setIngestFileName(file.name);
      setIngestFileSize(file.size);
      setStatusMessage("Ingest ready – review repository signals.");
      setActiveTab("repository");
      setActiveDraftId(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to read ingest file. Please retry.";
      setIngestError(message);
      setStatusMessage("Upload failed. Check the file and try again.");
      setIngestInsight(null);
      setActiveDraftId(null);
    }
  }, []);

  const handleFileInput = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      await handleParseFile(file);
    },
    [handleParseFile],
  );

  const handleDrop = useCallback(
    async (event: DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (!file) return;
      await handleParseFile(file);
    },
    [handleParseFile],
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const updateInput = useCallback(<K extends keyof PrdInputs>(key: K, value: PrdInputs[K]) => {
    setInputs((previous) => ({
      ...previous,
      [key]: value,
    }));
  }, []);

  const handleLoadDraft = useCallback(
    (draft: StoredDraft) => {
      setInputs(draft.inputs);
      setModel(draft.model);
      setPrdMarkdown(draft.markdown);
      setActiveDraftId(draft.id);
      setGenerationError(null);
      setExportError(null);
      const insight = draft.ingest?.insight ?? null;
      setIngestInsight(insight);
      setIngestFileName(draft.ingest?.fileName ?? "");
      setIngestFileSize(draft.ingest?.fileSize ?? 0);
      setStatusMessage(`Loaded draft "${draft.title}" (${formatDraftTimestamp(draft.createdAt)}).`);
      setActiveTab("output");
    },
    [],
  );

  const handleDeleteDraft = useCallback(
    (id: string) => {
      const updated = deleteDraft(id);
      setDrafts(updated);
      if (activeDraftId === id) {
        setActiveDraftId(null);
        setStatusMessage("Draft removed.");
      }
    },
    [activeDraftId],
  );

  const handleExportMarkdown = useCallback(() => {
    if (!canExport) {
      setExportError("Generate or load a PRD before exporting.");
      return;
    }
    try {
      const blob = new Blob([prdMarkdown], { type: "text/markdown;charset=utf-8" });
      downloadBlob(blob, composeFilename("md"));
      setExportError(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to export Markdown. Please retry.";
      setExportError(message);
    }
  }, [canExport, composeFilename, prdMarkdown]);

  const handleExportPdf = useCallback(async () => {
    if (!canExport) {
      setExportError("Generate or load a PRD before exporting.");
      return;
    }
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const margin = 48;
      const lineHeight = 16;
      const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
      const pageHeight = doc.internal.pageSize.getHeight();
      const plainText = markdownToPlain(prdMarkdown);
      const lines = doc.splitTextToSize(plainText, pageWidth);
      let cursorY = margin;

  lines.forEach((line: string) => {
        if (cursorY > pageHeight - margin) {
          doc.addPage();
          cursorY = margin;
        }
        doc.text(line, margin, cursorY);
        cursorY += lineHeight;
      });

      doc.save(composeFilename("pdf"));
      setExportError(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to export PDF. Please verify your browser supports downloads.";
      setExportError(message);
    }
  }, [canExport, composeFilename, prdMarkdown]);

  const handleExportDocx = useCallback(async () => {
    if (!canExport) {
      setExportError("Generate or load a PRD before exporting.");
      return;
    }
    try {
      const docx = await import("docx");
      const { Document, Packer } = docx;
      const paragraphs = buildDocxParagraphs(prdMarkdown, docx);
      const document = new Document({
        sections: [
          {
            properties: {},
            children: paragraphs,
          },
        ],
      });
      const blob = await Packer.toBlob(document);
      downloadBlob(blob, composeFilename("docx"));
      setExportError(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to export DOCX. Please retry.";
      setExportError(message);
    }
  }, [canExport, composeFilename, prdMarkdown]);

  const handleCopyMarkdown = useCallback(async () => {
    if (!canExport) {
      setExportError("Generate or load a PRD before copying.");
      return;
    }
    try {
      await navigator.clipboard.writeText(prdMarkdown);
      setExportError(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Clipboard access denied. Copy manually instead.";
      setExportError(message);
    }
  }, [canExport, prdMarkdown]);

  const handleGeneratePrd = useCallback(async () => {
    if (!apiKey) {
      setGenerationError("Provide your Gemini API key before generating.");
      setActiveTab("briefing");
      return;
    }
    if (!ingestInsight) {
      setGenerationError("Upload a git ingest export to ground the PRD.");
      setActiveTab("repository");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setExportError(null);
    setStatusMessage("Generating PRD with Gemini…");

    try {
      const client = new GoogleGenAI({ apiKey });
      const prompt = buildPrdPrompt(ingestInsight, inputs);
      const response = await client.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const markdown = response.text ?? "(Gemini returned an empty response.)";
      setPrdMarkdown(markdown);
      const nowIso = new Date().toISOString();
      const draftTitle = inputs.productName.trim() || ingestInsight.repoName || "Untitled PRD";
      const inputSnapshot = JSON.parse(JSON.stringify(inputs)) as PrdInputs;
      const sanitizedIngest = sanitizeIngestForStorage(ingestInsight);
      const draftId = safeUuid();
      const draft: StoredDraft = {
        id: draftId,
        title: draftTitle,
        createdAt: nowIso,
        model,
        inputs: inputSnapshot,
        markdown,
        ingest: sanitizedIngest || ingestFileName || ingestFileSize
          ? {
              insight: sanitizedIngest,
              fileName: ingestFileName || undefined,
              fileSize: ingestFileSize || undefined,
            }
          : undefined,
      };
      const updatedDrafts = saveDraft(draft);
      setDrafts(updatedDrafts);
      setActiveDraftId(draftId);
      setStatusMessage("PRD ready – review, refine, and export.");
      setActiveTab("output");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Gemini could not generate a PRD. Review the inputs and try again.";
      setGenerationError(message);
      setStatusMessage("Generation failed. Adjust briefing and retry.");
    } finally {
      setIsGenerating(false);
    }
  }, [
    apiKey,
    ingestFileName,
    ingestFileSize,
    ingestInsight,
    inputs,
    model,
  ]);

  return (
    <MacOSWindow
      title="PRD Studio"
      subtitle="Transform git ingest exports into Mac-native product specs"
      toolbar={
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
            <span className="flex h-[8px] w-[8px] items-center justify-center">
              <span
                className={`h-[8px] w-[8px] rounded-full ${
                  isGenerating ? "animate-pulse bg-blue-500" : "bg-emerald-400"
                }`}
              />
            </span>
            {statusMessage}
          </div>
          <button
            type="button"
            onClick={handleResetWorkspace}
            className="inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/80 px-3 py-1 text-[12px] font-medium text-slate-600 shadow-[0_6px_18px_rgba(15,27,55,0.08)] transition hover:border-white hover:bg-white hover:text-slate-900 active:translate-y-[1px] dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-200"
          >
            <ReloadIcon className="h-3.5 w-3.5" /> Reset workspace
          </button>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(320px,360px)_1fr]">
        <div className="flex flex-col gap-6">
          <SectionCard
            title="Git ingest reader"
            description="Drop the JSON export produced by git-ingest or similar repository scanners."
          >
            <label
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[16px] border-2 border-dashed border-slate-300/80 bg-white/80 px-6 py-10 text-center transition hover:border-blue-400/80 hover:bg-white/90 dark:border-slate-700/80 dark:bg-slate-950/40 dark:hover:border-blue-400/60 ${
                isDragging ? "border-blue-500/80 bg-blue-50/70 dark:bg-blue-500/10" : ""
              }`}
            >
              <input
                type="file"
                accept=".json,.txt,.md"
                onChange={handleFileInput}
                className="hidden"
              />
              <span className="rounded-full bg-blue-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-300">
                Upload
              </span>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Drop your <span className="font-medium">git-ingest.json</span> file or click to browse.
              </p>
              {ingestFileName ? (
                <div className="mt-3 flex flex-col gap-1 rounded-[12px] border border-white/70 bg-white/70 px-4 py-3 text-left text-sm shadow-[0_10px_24px_rgba(18,32,56,0.1)] dark:border-slate-800/70 dark:bg-slate-950/50">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {ingestFileName}
                  </span>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    {readableFileSize}
                  </span>
                </div>
              ) : null}
              {ingestError ? (
                <p className="text-xs font-medium text-red-500">{ingestError}</p>
              ) : null}
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tip: you can generate a git ingest export with tools like <span className="font-medium">github-csv-tools</span> or <span className="font-medium">trufflehog</span>. Any structured JSON snapshot works.
            </p>
          </SectionCard>

          <SectionCard
            title="Gemini connection"
            description="Run all LLM calls directly in your browser. We never store your key."
          >
            <div className="grid gap-3">
              <label className="grid gap-1 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">
                Gemini API key
                <input
                  type="password"
                  placeholder="Paste your google AI Studio key"
                  className={fieldClasses}
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value.trim())}
                />
              </label>
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberKey}
                    onChange={(event) => setRememberKey(event.target.checked)}
                    className="h-4 w-4 rounded border border-slate-300 text-blue-500 focus:ring-blue-400"
                  />
                  Remember this device
                </label>
                <Tooltip.Provider delayDuration={200}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <a
                        href="https://ai.google.dev/gemini-api/docs/api-key"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 underline-offset-4 transition hover:text-blue-500 dark:text-blue-300"
                      >
                        Where do I get a key?
                        <InfoCircledIcon className="h-3.5 w-3.5" />
                      </a>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content className="rounded-[10px] bg-slate-900 px-3 py-2 text-xs text-white shadow-xl" sideOffset={6}>
                        Generate a new key under Google AI Studio → API Keys.
                        <Tooltip.Arrow className="fill-slate-900" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </div>
              <label className="grid gap-1 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">
                Gemini model
                <select
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  className={`${fieldClasses} appearance-none`}
                >
                  {GEMINI_MODELS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <ul className="grid gap-2 rounded-[14px] border border-white/60 bg-white/70 p-4 text-xs text-slate-500 shadow-[0_10px_24px_rgba(20,32,54,0.08)] dark:border-slate-800/70 dark:bg-slate-950/30 dark:text-slate-300">
                {GEMINI_MODELS.map((option) => (
                  <li key={`${option.value}-meta`}>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{option.label}:</span> {option.description}
                  </li>
                ))}
              </ul>
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="Workspace"
          description="Craft the briefing, review repository intelligence, and generate a mac-native PRD."
          action={
            <button
              type="button"
              onClick={handleGeneratePrd}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 rounded-[14px] border border-blue-500/60 bg-blue-500/90 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(37,99,235,0.35)] transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-300"
            >
              <MagicWandIcon className="h-4 w-4" />
              {isGenerating ? "Generating…" : "Generate PRD"}
            </button>
          }
        >
          <Tabs.Root value={activeTab} onValueChange={(value) => setActiveTab(value as WorkspaceTab)}>
            <Tabs.List className="mb-4 flex gap-1 rounded-[12px] border border-white/70 bg-white/70 p-1 text-xs font-semibold text-slate-500 shadow-[0_8px_22px_rgba(18,28,48,0.08)] dark:border-slate-800/60 dark:bg-slate-950/40 dark:text-slate-300">
              <Tabs.Trigger
                value="briefing"
                className="flex-1 rounded-[10px] px-3 py-2 transition data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-[inset_0_1px_4px_rgba(15,27,55,0.25)] dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-slate-100"
              >
                Briefing
              </Tabs.Trigger>
              <Tabs.Trigger
                value="repository"
                className="flex-1 rounded-[10px] px-3 py-2 transition data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-[inset_0_1px_4px_rgba(15,27,55,0.25)] dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-slate-100"
              >
                Repository
              </Tabs.Trigger>
              <Tabs.Trigger
                value="output"
                className="flex-1 rounded-[10px] px-3 py-2 transition data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-[inset_0_1px_4px_rgba(15,27,55,0.25)] dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-slate-100"
              >
                PRD Output
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="briefing" className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">
                  Product name
                  <input
                    type="text"
                    className={fieldClasses}
                    value={inputs.productName}
                    onChange={(event) => updateInput("productName", event.target.value)}
                    placeholder="e.g. Repository Insights Studio"
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">
                  Target audience
                  <input
                    type="text"
                    className={fieldClasses}
                    value={inputs.targetAudience}
                    onChange={(event) => updateInput("targetAudience", event.target.value)}
                    placeholder="e.g. Platform PMs at enterprise-scale startups"
                  />
                </label>
              </div>
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">
                Product goal
                <textarea
                  rows={3}
                  className={fieldClasses}
                  value={inputs.productGoal}
                  onChange={(event) => updateInput("productGoal", event.target.value)}
                  placeholder="What are we trying to achieve?"
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">
                Key features
                <textarea
                  rows={3}
                  className={fieldClasses}
                  value={inputs.keyFeatures}
                  onChange={(event) => updateInput("keyFeatures", event.target.value)}
                  placeholder="List the headline capabilities and differentiators."
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">
                Success metrics
                <textarea
                  rows={2}
                  className={fieldClasses}
                  value={inputs.successMetrics}
                  onChange={(event) => updateInput("successMetrics", event.target.value)}
                  placeholder="How do we measure success?"
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">
                Constraints & assumptions
                <textarea
                  rows={2}
                  className={fieldClasses}
                  value={inputs.constraints}
                  onChange={(event) => updateInput("constraints", event.target.value)}
                  placeholder="List technical, legal, or operational constraints."
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px]">
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">
                  Additional notes
                  <textarea
                    rows={3}
                    className={fieldClasses}
                    value={inputs.additionalNotes}
                    onChange={(event) => updateInput("additionalNotes", event.target.value)}
                    placeholder="Call out integrations, risks, compliance, or stakeholders."
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">
                  Voice & tone
                  <select
                    value={inputs.tone}
                    onChange={(event) => updateInput("tone", event.target.value as PrdInputs["tone"])}
                    className={`${fieldClasses} appearance-none`}
                  >
                    <option value="executive">Executive summary</option>
                    <option value="detailed">Detailed narrative</option>
                    <option value="concise">Concise bullet-first</option>
                  </select>
                </label>
              </div>
              {generationError ? (
                <p className="rounded-[12px] border border-red-300 bg-red-50/70 px-4 py-3 text-xs font-medium text-red-600 dark:border-red-500/60 dark:bg-red-500/10 dark:text-red-200">
                  {generationError}
                </p>
              ) : null}
            </Tabs.Content>

            <Tabs.Content value="repository" className="grid gap-4">
              {ingestInsight ? (
                <div className="grid gap-4">
                  <div className="grid gap-2 rounded-[16px] border border-white/60 bg-white/80 p-5 text-sm shadow-[0_12px_28px_rgba(18,28,48,0.1)] dark:border-slate-800/70 dark:bg-slate-950/40">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">
                      Repository snapshot
                    </div>
                    <ul className="grid gap-2 text-sm text-slate-600 dark:text-slate-200">
                      {ingestInsight.repoName ? (
                        <li>
                          <span className="font-semibold text-slate-900 dark:text-slate-50">Repo:</span> {ingestInsight.repoName}
                        </li>
                      ) : null}
                      {ingestInsight.lastUpdated ? (
                        <li>
                          <span className="font-semibold text-slate-900 dark:text-slate-50">Last updated:</span> {ingestInsight.lastUpdated}
                        </li>
                      ) : null}
                      <li>
                        <span className="font-semibold text-slate-900 dark:text-slate-50">Files tracked:</span> {ingestInsight.fileCount}
                      </li>
                      <li>
                        <span className="font-semibold text-slate-900 dark:text-slate-50">Key modules:</span> {ingestInsight.moduleNames.join(", ") || "Not detected"}
                      </li>
                      <li>
                        <span className="font-semibold text-slate-900 dark:text-slate-50">Languages:</span> {ingestInsight.languageStats.map(({ language, count }) => `${language} (${count})`).join(", ") || "Unknown"}
                      </li>
                    </ul>
                  </div>
                  <div className="grid gap-3">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">
                      Auto insights
                    </h3>
                    <ul className="grid gap-2">
                      {ingestInsight.keyInsights.length ? (
                        ingestInsight.keyInsights.map((insight) => (
                          <li
                            key={insight}
                            className="rounded-[14px] border border-white/60 bg-white/70 px-4 py-3 text-sm text-slate-700 shadow-[0_10px_24px_rgba(20,32,54,0.08)] dark:border-slate-800/70 dark:bg-slate-950/30 dark:text-slate-200"
                          >
                            {insight}
                          </li>
                        ))
                      ) : (
                        <li className="rounded-[14px] border border-dashed border-slate-300/60 bg-white/40 px-4 py-3 text-sm text-slate-500 dark:border-slate-700/60 dark:bg-slate-950/20">
                          No insights available yet. Provide a richer ingest file for more context.
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="grid gap-3">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">
                      Raw ingest preview
                    </h3>
                    <div className="rounded-[16px] border border-white/60 bg-slate-900/90 p-0 text-xs text-slate-100 shadow-[0_14px_30px_rgba(10,18,36,0.65)]">
                      <ScrollArea.Root className="h-[280px] w-full overflow-hidden rounded-[16px]">
                        <ScrollArea.Viewport className="grid p-4">
                          <pre className="whitespace-pre-wrap break-words font-mono text-[12px] leading-relaxed">
                            {ingestInsight.rawText.slice(0, 5_000)}
                            {ingestInsight.rawText.length > 5_000 ? "\n… (truncated)" : ""}
                          </pre>
                        </ScrollArea.Viewport>
                        <ScrollArea.Scrollbar
                          orientation="vertical"
                          className="flex w-2.5 select-none touch-none rounded-full bg-slate-700/40"
                        >
                          <ScrollArea.Thumb className="relative flex-1 rounded-full bg-slate-400" />
                        </ScrollArea.Scrollbar>
                      </ScrollArea.Root>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[16px] border border-dashed border-slate-300/60 bg-white/50 px-6 py-12 text-center text-sm text-slate-500 dark:border-slate-700/60 dark:bg-slate-950/30">
                  Upload a git ingest export to unlock repository context.
                </div>
              )}
            </Tabs.Content>

            <Tabs.Content value="output" className="grid gap-4">
              {prdMarkdown ? (
                <div className="grid gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">
                        Generated PRD
                      </h3>
                      {activeDraft ? (
                        <span className="text-[11px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                          Saved {formatDraftTimestamp(activeDraft.createdAt)}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyMarkdown}
                        disabled={!canExport}
                        className="inline-flex items-center gap-2 rounded-[12px] border border-white/60 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_12px_22px_rgba(20,32,54,0.1)] transition hover:border-white hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 dark:border-slate-800/70 dark:bg-slate-950/40 dark:text-slate-200"
                      >
                        Copy
                      </button>
                      <button
                        type="button"
                        onClick={handleExportMarkdown}
                        disabled={!canExport}
                        className="inline-flex items-center gap-2 rounded-[12px] border border-white/60 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_12px_22px_rgba(20,32,54,0.1)] transition hover:border-white hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 dark:border-slate-800/70 dark:bg-slate-950/40 dark:text-slate-200"
                      >
                        .md
                      </button>
                      <button
                        type="button"
                        onClick={handleExportPdf}
                        disabled={!canExport}
                        className="inline-flex items-center gap-2 rounded-[12px] border border-white/60 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_12px_22px_rgba(20,32,54,0.1)] transition hover:border-white hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 dark:border-slate-800/70 dark:bg-slate-950/40 dark:text-slate-200"
                      >
                        PDF
                      </button>
                      <button
                        type="button"
                        onClick={handleExportDocx}
                        disabled={!canExport}
                        className="inline-flex items-center gap-2 rounded-[12px] border border-white/60 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_12px_22px_rgba(20,32,54,0.1)] transition hover:border-white hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 dark:border-slate-800/70 dark:bg-slate-950/40 dark:text-slate-200"
                      >
                        DOCX
                      </button>
                    </div>
                  </div>
                  {exportError ? (
                    <p className="rounded-[12px] border border-red-300 bg-red-50/70 px-4 py-3 text-xs font-medium text-red-600 dark:border-red-500/60 dark:bg-red-500/10 dark:text-red-200">
                      {exportError}
                    </p>
                  ) : null}
                  <div className="rounded-[18px] border border-white/70 bg-white/80 p-0 shadow-[0_14px_32px_rgba(20,32,54,0.08)] dark:border-slate-800/70 dark:bg-slate-950/40">
                    <ScrollArea.Root className="h-[420px] w-full overflow-hidden rounded-[18px]">
                      <ScrollArea.Viewport className="grid p-6">
                        <article className="prose prose-slate max-w-none text-sm leading-relaxed dark:prose-invert">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{prdMarkdown}</ReactMarkdown>
                        </article>
                      </ScrollArea.Viewport>
                      <ScrollArea.Scrollbar
                        orientation="vertical"
                        className="flex w-2.5 select-none touch-none rounded-full bg-slate-700/30"
                      >
                        <ScrollArea.Thumb className="relative flex-1 rounded-full bg-slate-400" />
                      </ScrollArea.Scrollbar>
                    </ScrollArea.Root>
                  </div>
                  <div className="grid gap-3 rounded-[16px] border border-white/70 bg-white/70 p-5 shadow-[0_12px_26px_rgba(20,32,54,0.1)] dark:border-slate-800/70 dark:bg-slate-950/30">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">
                        Saved drafts
                      </h3>
                      <span className="text-[11px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                        {drafts.length} stored
                      </span>
                    </div>
                    {drafts.length ? (
                      <ul className="grid gap-2">
                        {drafts.map((draft) => {
                          const isActive = draft.id === activeDraftId;
                          return (
                            <li
                              key={draft.id}
                              className={`flex flex-wrap items-center justify-between gap-3 rounded-[14px] border px-4 py-3 text-sm shadow-[0_8px_18px_rgba(20,32,54,0.08)] transition ${
                                isActive
                                  ? "border-blue-400/80 bg-blue-50/80 dark:border-blue-500/60 dark:bg-blue-500/10"
                                  : "border-white/70 bg-white/80 dark:border-slate-800/70 dark:bg-slate-950/40"
                              }`}
                            >
                              <div className="flex min-w-0 flex-col">
                                <span className="truncate font-semibold text-slate-800 dark:text-slate-100">
                                  {draft.title}
                                </span>
                                <span className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                                  {formatDraftTimestamp(draft.createdAt)} · {draft.model}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleLoadDraft(draft)}
                                  className="rounded-[10px] border border-white/60 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-[0_8px_16px_rgba(20,32,54,0.08)] transition hover:border-white hover:bg-white dark:border-slate-800/70 dark:bg-slate-950/40 dark:text-slate-200"
                                >
                                  Load
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDraft(draft.id)}
                                  className="rounded-[10px] border border-red-300 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 shadow-[0_8px_16px_rgba(244,63,94,0.15)] transition hover:border-red-400 hover:bg-red-100 dark:border-red-500/60 dark:bg-red-500/10 dark:text-red-200"
                                >
                                  Delete
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="rounded-[12px] border border-dashed border-slate-300/60 bg-white/40 px-4 py-4 text-sm text-slate-500 dark:border-slate-700/60 dark:bg-slate-950/20">
                        Generated drafts will be cached here for offline access.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-[16px] border border-dashed border-slate-300/60 bg-white/50 px-6 py-12 text-center text-sm text-slate-500 dark:border-slate-700/60 dark:bg-slate-950/30">
                  Generate a PRD to see the output here.
                </div>
              )}
            </Tabs.Content>
          </Tabs.Root>
        </SectionCard>
      </div>
    </MacOSWindow>
  );
}
