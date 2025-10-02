import { IngestInsight } from './ingest';

export interface PrdInputs {
  productName: string;
  productGoal: string;
  targetAudience: string;
  keyFeatures: string;
  successMetrics: string;
  constraints: string;
  tone: 'executive' | 'detailed' | 'concise';
  additionalNotes: string;
}

const MAX_SUPPORTING_CONTEXT = 7_500;

export function buildPrdPrompt(
  insight: IngestInsight,
  inputs: PrdInputs
): string {
  const truncatedContext =
    insight.rawText.length > MAX_SUPPORTING_CONTEXT
      ? `${insight.rawText.slice(0, MAX_SUPPORTING_CONTEXT)}\n\n[context truncated due to size]`
      : insight.rawText;

  const detectedLanguages =
    insight.languageStats
      .map(({ language, count }) => `${language}: ${count} files`)
      .join(' | ') || 'No language data detected';

  const moduleOverview = insight.moduleNames.length
    ? insight.moduleNames.join(', ')
    : 'Modules not inferred';

  const metaLines = [
    insight.repoName ? `Repository name: ${insight.repoName}` : null,
    insight.lastUpdated ? `Last updated: ${insight.lastUpdated}` : null,
    `Files tracked: ${insight.fileCount}`,
    `Language distribution: ${detectedLanguages}`,
    `Prominent modules: ${moduleOverview}`
  ]
    .filter(Boolean)
    .join('\n');

  return `You are a senior product strategist and technical writer. Create a comprehensive Product Requirements Document (PRD) for the following product using the repository ingest data as factual grounding.

[Repository digest]
${metaLines}
Key insights:
${insight.keyInsights.map((item) => `- ${item}`).join('\n') || '- No automatic insights'}

[Raw ingest excerpt]
${truncatedContext}

[Product briefing]
- Product name: ${inputs.productName || '(not provided)'}
- Product goal: ${inputs.productGoal || '(not provided)'}
- Target audience: ${inputs.targetAudience || '(not provided)'}
- Key features: ${inputs.keyFeatures || '(not provided)'}
- Success metrics: ${inputs.successMetrics || '(not provided)'}
- Constraints: ${inputs.constraints || '(not provided)'}
- Additional notes: ${inputs.additionalNotes || '(none)'}

[Response expectations]
1. Present a polished PRD with clear section headings (Overview, Problem, Solution, User Personas, Feature Breakdown, Functional Requirements, Non-Functional Requirements, Success Metrics, Release Plan, Risks & Mitigations, Open Questions).
2. Reference repository insights wherever relevant, especially for technical feasibility and system architecture.
3. Adopt a ${inputs.tone} tone and keep the writing precise and informative.
4. Highlight gaps in available information as action items.
5. Emphasize how the existing codebase or assets accelerate delivery.

Return the PRD in Markdown.`;
}
