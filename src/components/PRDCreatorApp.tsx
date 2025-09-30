'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import Button from './ui/Button';
import InputField from './ui/InputField';
import TextareaField from './ui/TextareaField';
import Modal from './ui/Modal';
import Loader from './ui/Loader';
import MarkdownRenderer from './ui/MarkdownRenderer';
import type { PRDInput } from '../types';
import { cn, formatError } from '../lib/utils';
import { useGeminiKey } from '../hooks/useGeminiKey';
import {
  generateInputsFromIdea,
  generatePRDStream,
  refineSection
} from '../lib/geminiClient';
import {
  Sparkles,
  Target,
  ClipboardList,
  Rocket,
  PenLine,
  ShieldCheck,
  Wand2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Coffee
} from 'lucide-react';

const INITIAL_INPUT: PRDInput = {
  productName: '',
  targetAudience: '',
  problemStatement: '',
  proposedSolution: '',
  coreFeatures: '',
  businessGoals: '',
  futureFeatures: '',
  techStack: '',
  constraints: ''
};

const SECTION_TITLES = {
  core: '1. Core Product Idea',
  audience: '2. Audience & Market',
  features: '3. Features & Scope',
  technical: '4. Technical Details (Optional)'
} as const;

type SectionKey = keyof typeof SECTION_TITLES;

const REQUIRED_FIELDS: Array<keyof PRDInput> = [
  'productName',
  'targetAudience',
  'problemStatement',
  'proposedSolution',
  'coreFeatures'
];

const SUPPORT_URL = 'https://buymeacoffee.com/aungmyokyaw';

type ApiOperation = 'prefill' | 'generate' | 'refine';

type FieldElement = HTMLInputElement | HTMLTextAreaElement;

interface ValidationResult {
  isValid: boolean;
  firstErrorKey: keyof PRDInput | null;
}

const generatePreview = (input: PRDInput): string => {
  return `# ${input.productName || 'Your Product Name'}

---

### 1. Introduction & Vision

**1.1 Problem Statement**
${input.problemStatement || '*Describe the core problem your product solves.*'}

**1.2 Proposed Solution**
${
  input.proposedSolution ||
  '*Explain how your product uniquely solves the problem.*'
}

**1.3 Vision**
*AI will craft a compelling long-term vision based on your inputs.*

---

### 2. Target Audience & Personas

**2.1 Primary Audience**
${
  input.targetAudience ||
  '*Add details about who benefits most from this solution.*'
}

**2.2 Personas**
*AI will produce 2-3 nuanced personas aligned with your target audience.*

---

### 3. Product Goals & Success Metrics

**3.1 Business Goals**
${input.businessGoals || '*Add your north-star business outcomes and KPIs.*'}

**3.2 Success Metrics**
*AI will generate SMART metrics that map to your business goals.*

---

### 4. Features & Scope

**4.1 Core Features (MVP)**
${input.coreFeatures || '- Start listing essential capabilities for launch.'}

**4.2 User Stories**
*AI will translate features into actionable user stories across personas.*

**4.3 Future Features**
${input.futureFeatures || '- Capture ideas you want to iterate on post-MVP.'}

---

### 5. Technical Considerations

**5.1 Technology Stack**
${
  input.techStack ||
  '*Mention preferred frameworks, languages, and infrastructure.*'
}

**5.2 Constraints & Dependencies**
${
  input.constraints ||
  '*Highlight regulatory, operational, or technical constraints.*'
}

---

### 6. Out of Scope

*AI clarifies what the MVP will intentionally not cover to manage stakeholder expectations.*`;
};

interface RefineState {
  isOpen: boolean;
  sectionKey: SectionKey | null;
  feedback: string;
}

const PRDCreatorApp: React.FC = () => {
  const [productIdea, setProductIdea] = useState('');
  const [prdInput, setPrdInput] = useState<PRDInput>(INITIAL_INPUT);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof PRDInput, string>>
  >({});

  const [generatedPrd, setGeneratedPrd] = useState('');
  const [isPrefilling, setIsPrefilling] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  const [prefillError, setPrefillError] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [refineError, setRefineError] = useState<string | null>(null);

  const [refineState, setRefineState] = useState<RefineState>({
    isOpen: false,
    sectionKey: null,
    feedback: ''
  });
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [keyDraft, setKeyDraft] = useState('');
  const [keyFeedback, setKeyFeedback] = useState<string | null>(null);

  const {
    apiKey,
    hasKey,
    isReady: isKeyReady,
    isProcessing: isKeyProcessing,
    error: keyError,
    saveKey,
    clearKey,
    resetError: resetKeyError
  } = useGeminiKey();

  const fieldRefs = useRef<Record<keyof PRDInput, FieldElement | null>>({
    productName: null,
    targetAudience: null,
    problemStatement: null,
    proposedSolution: null,
    coreFeatures: null,
    businessGoals: null,
    futureFeatures: null,
    techStack: null,
    constraints: null
  });

  const requestCounters = useRef<Record<ApiOperation, number>>({
    prefill: 0,
    generate: 0,
    refine: 0
  });

  const trimmedIdea = productIdea.trim();

  const livePreview = useMemo(() => generatePreview(prdInput), [prdInput]);

  const maskedKey = useMemo(() => {
    if (!apiKey) {
      return 'Not configured';
    }

    if (apiKey.length <= 8) {
      return `${apiKey.slice(0, 2)}•••${apiKey.slice(-2)}`;
    }

    return `${apiKey.slice(0, 4)}•••${apiKey.slice(-4)}`;
  }, [apiKey]);

  useEffect(() => {
    if (!isKeyModalOpen) {
      setKeyDraft('');
      resetKeyError();
    }
  }, [isKeyModalOpen, resetKeyError]);

  const updateInput = useCallback(
    (field: keyof PRDInput, value: string) => {
      setPrdInput((prev) => ({ ...prev, [field]: value }));
      if (formErrors[field]) {
        setFormErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [formErrors]
  );

  const scrollToField = useCallback((field: keyof PRDInput) => {
    const element = fieldRefs.current[field];
    if (!element) return;

    element.focus({ preventScroll: false });
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const validateForm = useCallback((): ValidationResult => {
    const errors: Partial<Record<keyof PRDInput, string>> = {};
    let firstErrorKey: keyof PRDInput | null = null;

    REQUIRED_FIELDS.forEach((field) => {
      if (!prdInput[field]?.trim()) {
        errors[field] = 'This field is required to generate a complete PRD.';
        if (!firstErrorKey) {
          firstErrorKey = field;
        }
      }
    });
    setFormErrors(errors);

    return {
      isValid: Object.keys(errors).length === 0,
      firstErrorKey
    };
  }, [prdInput]);

  const handlePrefill = useCallback(async () => {
    if (!trimmedIdea) {
      setPrefillError(
        'Share a product idea first so we can brainstorm together.'
      );
      return;
    }

    if (!apiKey) {
      setPrefillError('Please add your Gemini API key first.');
      return;
    }

    setPrefillError(null);
    const currentRequest = requestCounters.current.prefill + 1;
    requestCounters.current.prefill = currentRequest;
    setIsPrefilling(true);
    try {
      const result = await generateInputsFromIdea(apiKey, trimmedIdea);

      if (result.success && result.data) {
        setPrdInput(result.data.input);
        setGeneratedPrd('');
        setFormErrors({});
      } else {
        setPrefillError(result.error || 'Failed to generate inputs');
      }
    } catch (error) {
      setPrefillError(formatError(error));
    } finally {
      if (requestCounters.current.prefill === currentRequest) {
        setIsPrefilling(false);
      }
    }
  }, [trimmedIdea, apiKey]);

  const handleGenerate = useCallback(async () => {
    setGenerationError(null);

    const { isValid, firstErrorKey } = validateForm();

    if (!isValid) {
      setGenerationError(
        'Complete the highlighted fields so the AI has strong inputs to work with.'
      );
      if (firstErrorKey) {
        requestAnimationFrame(() => {
          scrollToField(firstErrorKey);
        });
      }
      return;
    }

    if (!apiKey) {
      setGenerationError('Please add your Gemini API key first.');
      return;
    }

    const currentRequest = requestCounters.current.generate + 1;
    requestCounters.current.generate = currentRequest;
    setIsGenerating(true);
    setGeneratedPrd(''); // Reset PRD before streaming

    try {
      let accumulatedText = '';

      for await (const chunk of generatePRDStream(apiKey, prdInput)) {
        if (chunk.type === 'chunk' && chunk.text) {
          accumulatedText += chunk.text;
          setGeneratedPrd(accumulatedText);
        } else if (chunk.type === 'complete') {
          if (chunk.fullText) {
            setGeneratedPrd(chunk.fullText);
          }

          // Check if generation was incomplete
          if (!chunk.wasComplete && chunk.finishReason === 'MAX_TOKENS') {
            setGenerationError(
              'The PRD reached the maximum length limit and may be incomplete. The AI generated as much as it could. Consider simplifying your inputs or breaking this into multiple PRDs.'
            );
          }
        }
      }
    } catch (error) {
      setGenerationError(formatError(error));
    } finally {
      if (requestCounters.current.generate === currentRequest) {
        setIsGenerating(false);
      }
    }
  }, [prdInput, validateForm, scrollToField, apiKey]);

  const openRefineModal = useCallback((sectionKey: SectionKey) => {
    setRefineState({ isOpen: true, sectionKey, feedback: '' });
    setRefineError(null);
  }, []);

  const closeRefineModal = useCallback(() => {
    if (isRefining) return;
    setRefineState({ isOpen: false, sectionKey: null, feedback: '' });
    setRefineError(null);
  }, [isRefining]);

  const handleRefine = useCallback(async () => {
    if (!refineState.sectionKey || !refineState.feedback.trim()) {
      setRefineError(
        'Share what you would like to adjust so we can refine it.'
      );
      return;
    }

    if (!apiKey) {
      setRefineError('Please add your Gemini API key first.');
      return;
    }

    const currentRequest = requestCounters.current.refine + 1;
    requestCounters.current.refine = currentRequest;
    setIsRefining(true);
    setRefineError(null);
    try {
      const result = await refineSection(
        apiKey,
        SECTION_TITLES[refineState.sectionKey],
        refineState.feedback,
        prdInput
      );

      if (result.success && result.data) {
        setPrdInput((prev) => ({ ...prev, ...result.data!.updatedInput }));
        closeRefineModal();
      } else {
        setRefineError(result.error || 'Failed to refine section');
      }
    } catch (error) {
      setRefineError(formatError(error));
    } finally {
      if (requestCounters.current.refine === currentRequest) {
        setIsRefining(false);
      }
    }
  }, [refineState, prdInput, apiKey, closeRefineModal]);

  const openKeyModal = useCallback(() => {
    setKeyFeedback(null);
    setIsKeyModalOpen(true);
  }, []);

  const closeKeyModal = useCallback(() => {
    if (isKeyProcessing) return;
    setIsKeyModalOpen(false);
  }, [isKeyProcessing]);

  const handleResetForm = useCallback(() => {
    if (isGenerating || isPrefilling || isRefining) {
      return;
    }

    setPrdInput(INITIAL_INPUT);
    setFormErrors({});
    setGeneratedPrd('');
    setGenerationError(null);
  }, [isGenerating, isPrefilling, isRefining]);

  const handleSaveKey = useCallback(async () => {
    setKeyFeedback(null);
    try {
      await saveKey(keyDraft);
      setKeyFeedback('Gemini API key encrypted and stored for this browser.');
      setIsKeyModalOpen(false);
      setKeyDraft('');
    } catch (error) {
      console.error('Failed to store Gemini key', error);
    }
  }, [keyDraft, saveKey]);

  const handleClearKey = useCallback(async () => {
    setKeyFeedback(null);
    try {
      await clearKey();
      setKeyFeedback('Stored Gemini API key removed from this device.');
    } catch (error) {
      console.error('Failed to clear Gemini key', error);
    }
  }, [clearKey]);

  const isInteracting = isGenerating || isPrefilling || isRefining;
  const canPrefill = trimmedIdea.length >= 10;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      <div className="absolute inset-0">
        <div className="pointer-events-none absolute -left-10 top-10 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute right-10 bottom-10 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        <header className="mb-12 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-200">
              <Sparkles className="h-4 w-4" /> World-class PRD co-pilot
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl">
              Design, refine, and ship extraordinary product narratives in
              minutes.
            </h1>
            <p className="text-lg text-slate-300">
              Feed the AI with your product vision, collaborate on the details,
              and deliver studio-grade Product Requirements Documents that align
              stakeholders instantly.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-500/70',
                  'bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25',
                  'transition-transform duration-200 hover:from-indigo-500 hover:to-purple-500 hover:shadow-xl hover:-translate-y-[1px] focus-ring'
                )}
              >
                <Coffee className="h-4 w-4" /> Buy Aung Myo Kyaw a coffee
              </a>
              <p className="max-w-xs text-xs text-slate-400">
                Love the tool? Your support keeps new product storytelling
                features shipping.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-800/40 px-4 py-2">
                <Target className="h-4 w-4 text-indigo-300" /> Persona-rich
                insights
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-800/40 px-4 py-2">
                <ClipboardList className="h-4 w-4 text-indigo-300" /> Founder to
                dev-ready in 5 mins
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-800/40 px-4 py-2">
                <ShieldCheck className="h-4 w-4 text-indigo-300" /> Precision
                controls & edits
              </div>
            </div>
          </div>
          <div className="grid w-full max-w-sm grid-cols-1 gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300 shadow-xl lg:max-w-xs">
            <div className="flex items-center gap-3">
              <Rocket className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="font-semibold text-slate-100">
                  Instant alignment
                </p>
                <p className="text-xs text-slate-400">
                  Auto generates personas, user stories, and KPIs that resonate.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Wand2 className="h-5 w-5 text-indigo-400" />
              <div>
                <p className="font-semibold text-slate-100">
                  Iterate in context
                </p>
                <p className="text-xs text-slate-400">
                  Refine any section with conversational feedback.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <PenLine className="h-5 w-5 text-cyan-400" />
              <div>
                <p className="font-semibold text-slate-100">
                  Narratives that convert
                </p>
                <p className="text-xs text-slate-400">
                  Compelling storytelling meets rigorous product detail.
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          {/* Left column */}
          <div className="space-y-8">
            <div className="glass rounded-2xl border border-slate-800/70 p-6 shadow-2xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10">
                    <KeyRound className="h-5 w-5 text-indigo-300" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Gemini API access
                    </h2>
                    <p className="text-sm text-slate-400">
                      Configure your Gemini API key locally. We encrypt it
                      before storing it in your browser and only attach it to
                      calls from this session.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-slate-700/70 px-3 py-1 text-xs text-slate-300">
                  {hasKey ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Connected · {maskedKey}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-amber-400" />
                      <span>{isKeyReady ? 'Not configured' : 'Loading'}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="primary"
                  size="md"
                  onClick={openKeyModal}
                  disabled={isKeyProcessing}
                >
                  {hasKey ? 'Update Gemini key' : 'Add Gemini key'}
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleClearKey}
                  disabled={!hasKey || isKeyProcessing}
                >
                  Remove stored key
                </Button>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Your key never leaves this browser outside of encrypted API
                calls to Gemini.
              </p>
              {(keyError || keyFeedback) && (
                <div
                  className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
                    keyError
                      ? 'border-red-500/40 bg-red-950/40 text-red-200'
                      : 'border-emerald-500/30 bg-emerald-950/30 text-emerald-200'
                  }`}
                >
                  {keyError || keyFeedback}
                </div>
              )}
            </div>

            <div className="glass rounded-2xl border border-slate-800/70 p-6 shadow-2xl">
              <h2 className="text-xl font-semibold text-white">
                Stage 1 · Ignite your idea
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Share your vision and let the AI expand it into structured,
                actionable building blocks.
              </p>
              <div className="mt-6 space-y-4">
                <TextareaField
                  label="Your Product Idea"
                  placeholder="e.g. A co-pilot that analyzes product usage and proactively suggests roadmap adjustments for PMs."
                  value={productIdea}
                  onChange={(event) => {
                    setProductIdea(event.target.value);
                    if (prefillError) {
                      setPrefillError(null);
                    }
                  }}
                  rows={3}
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handlePrefill}
                    isLoading={isPrefilling}
                    disabled={isPrefilling || !canPrefill}
                  >
                    {isPrefilling
                      ? 'Strategizing...'
                      : 'Let AI structure my idea'}
                  </Button>
                  <p className="text-xs text-slate-500">
                    {canPrefill
                      ? 'We never store your prompts. Everything stays within your session.'
                      : 'Add at least 10 characters so the AI has enough context to brainstorm.'}
                  </p>
                </div>
                {prefillError && (
                  <div className="rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                    {prefillError}
                  </div>
                )}
              </div>
            </div>

            <div className="glass rounded-2xl border border-slate-800/70 p-6 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Stage 2 · Shape the narrative
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Fill in or fine-tune the details. The richer your
                    perspective, the sharper the PRD.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleResetForm}
                  disabled={isInteracting}
                >
                  Reset form
                </Button>
              </div>

              <div className="mt-8 space-y-10">
                <section className="space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {SECTION_TITLES.core}
                      </h3>
                      <p className="text-sm text-slate-400">
                        Define the product heartbeat and the change it promises.
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openRefineModal('core')}
                    >
                      Refine with AI
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <InputField
                      label="Product Name"
                      placeholder="Give your concept an evocative title."
                      value={prdInput.productName}
                      onChange={(event) =>
                        updateInput('productName', event.target.value)
                      }
                      error={formErrors.productName}
                      id="productName"
                      name="productName"
                      ref={(element) => {
                        fieldRefs.current.productName = element;
                      }}
                    />
                    <InputField
                      label="Target Audience"
                      placeholder="Who will obsess over this product?"
                      value={prdInput.targetAudience}
                      onChange={(event) =>
                        updateInput('targetAudience', event.target.value)
                      }
                      error={formErrors.targetAudience}
                      id="targetAudience"
                      name="targetAudience"
                      ref={(element) => {
                        fieldRefs.current.targetAudience = element;
                      }}
                    />
                  </div>
                  <TextareaField
                    label="Problem Statement"
                    placeholder="What persistent friction are you erasing?"
                    value={prdInput.problemStatement}
                    onChange={(event) =>
                      updateInput('problemStatement', event.target.value)
                    }
                    error={formErrors.problemStatement}
                    rows={4}
                    id="problemStatement"
                    name="problemStatement"
                    ref={(element) => {
                      fieldRefs.current.problemStatement = element;
                    }}
                  />
                  <TextareaField
                    label="Proposed Solution"
                    placeholder="Distill the breakthrough experience your product delivers."
                    value={prdInput.proposedSolution}
                    onChange={(event) =>
                      updateInput('proposedSolution', event.target.value)
                    }
                    error={formErrors.proposedSolution}
                    rows={4}
                    id="proposedSolution"
                    name="proposedSolution"
                    ref={(element) => {
                      fieldRefs.current.proposedSolution = element;
                    }}
                  />
                </section>

                <section className="space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {SECTION_TITLES.audience}
                      </h3>
                      <p className="text-sm text-slate-400">
                        Who you serve, why they care, and how we win them over.
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openRefineModal('audience')}
                    >
                      Refine with AI
                    </Button>
                  </div>
                  <TextareaField
                    label="Business Goals & KPIs"
                    placeholder="Share the growth metrics, adoption targets, or revenue milestones that matter."
                    value={prdInput.businessGoals}
                    onChange={(event) =>
                      updateInput('businessGoals', event.target.value)
                    }
                    rows={4}
                    id="businessGoals"
                    name="businessGoals"
                    ref={(element) => {
                      fieldRefs.current.businessGoals = element;
                    }}
                  />
                </section>

                <section className="space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {SECTION_TITLES.features}
                      </h3>
                      <p className="text-sm text-slate-400">
                        Prioritize the experiences that make your product
                        inevitable.
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openRefineModal('features')}
                    >
                      Refine with AI
                    </Button>
                  </div>
                  <TextareaField
                    label="Core Features (MVP)"
                    placeholder="List the must-have journeys your first release absolutely nails."
                    value={prdInput.coreFeatures}
                    onChange={(event) =>
                      updateInput('coreFeatures', event.target.value)
                    }
                    error={formErrors.coreFeatures}
                    rows={5}
                    id="coreFeatures"
                    name="coreFeatures"
                    ref={(element) => {
                      fieldRefs.current.coreFeatures = element;
                    }}
                  />
                  <TextareaField
                    label="Future Features"
                    placeholder="Capture bold ideas you want to stage for later."
                    value={prdInput.futureFeatures}
                    onChange={(event) =>
                      updateInput('futureFeatures', event.target.value)
                    }
                    rows={4}
                    id="futureFeatures"
                    name="futureFeatures"
                    ref={(element) => {
                      fieldRefs.current.futureFeatures = element;
                    }}
                  />
                </section>

                <section className="space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {SECTION_TITLES.technical}
                      </h3>
                      <p className="text-sm text-slate-400">
                        Share constraints and architectural preferences upfront.
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openRefineModal('technical')}
                    >
                      Refine with AI
                    </Button>
                  </div>
                  <InputField
                    label="Preferred Tech Stack"
                    placeholder="e.g. Next.js, React Native, GraphQL, PostgreSQL, AWS"
                    value={prdInput.techStack}
                    onChange={(event) =>
                      updateInput('techStack', event.target.value)
                    }
                    id="techStack"
                    name="techStack"
                    ref={(element) => {
                      fieldRefs.current.techStack = element;
                    }}
                  />
                  <TextareaField
                    label="Constraints & Dependencies"
                    placeholder="Are there regulatory, data, or resourcing considerations to account for?"
                    value={prdInput.constraints}
                    onChange={(event) =>
                      updateInput('constraints', event.target.value)
                    }
                    rows={4}
                    id="constraints"
                    name="constraints"
                    ref={(element) => {
                      fieldRefs.current.constraints = element;
                    }}
                  />
                </section>
              </div>

              <div className="mt-10 space-y-4">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleGenerate}
                  isLoading={isGenerating}
                  disabled={isGenerating}
                >
                  {isGenerating
                    ? 'Authoring your PRD...'
                    : 'Generate my executive-ready PRD'}
                </Button>
                {generationError && (
                  <div className="rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                    {generationError}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6 lg:sticky lg:top-20 lg:pr-2">
            {isGenerating && (
              <Loader
                message="The AI is weaving narrative threads and orchestrating KPIs."
                variant="pulse"
                size="md"
              />
            )}
            {!isGenerating && (
              <MarkdownRenderer
                content={generatedPrd || livePreview}
                isLivePreview={!generatedPrd}
                className="shadow-2xl"
              />
            )}
            <div className="glass rounded-2xl border border-slate-800/60 p-6">
              <h3 className="text-base font-semibold text-white">
                Delivery quality checklist
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Persona-driven storytelling that wins leadership trust.
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  User stories, KPIs, and scope guardrails pre-vetted by AI.
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Export-ready markdown that drops seamlessly into Notion,
                  Confluence, or Linear.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/60 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} PRD Creator. Designed for visionary
            product teams.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              className="inline-flex items-center gap-2 hover:text-slate-300"
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Coffee className="h-4 w-4" /> Support the project
            </a>
            <a className="hover:text-slate-300" href="#">
              Privacy
            </a>
            <a className="hover:text-slate-300" href="#">
              Security
            </a>
            <a className="hover:text-slate-300" href="#">
              Release notes
            </a>
          </div>
        </div>
      </footer>

      <Modal
        isOpen={refineState.isOpen}
        onClose={closeRefineModal}
        title={`Refine · ${
          refineState.sectionKey ? SECTION_TITLES[refineState.sectionKey] : ''
        }`}
      >
        <p className="text-sm text-slate-400">
          Tell the AI how to tweak tone, add details, or reframe the section. It
          will respond with contextual updates rather than generic rewrites.
        </p>
        <TextareaField
          label="Your Feedback"
          value={refineState.feedback}
          onChange={(event) =>
            setRefineState((prev) => ({
              ...prev,
              feedback: event.target.value
            }))
          }
          rows={5}
          placeholder='e.g. "Make the problem statement data-backed and insert a growth KPI"'
          className="mt-4"
        />
        {refineError && (
          <div className="mt-4 rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {refineError}
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={closeRefineModal}
            disabled={isRefining}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleRefine}
            isLoading={isRefining}
          >
            {isRefining ? 'Reframing...' : 'Apply refinement'}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isKeyModalOpen}
        onClose={closeKeyModal}
        title="Gemini API key"
      >
        <p className="text-sm text-slate-400">
          Paste your Gemini API key below. We encrypt it with a browser-bound
          secret and store it in local storage so only this device can decrypt
          it.
        </p>
        <div className="mt-4">
          <InputField
            label="Gemini API key"
            placeholder="Paste your key (e.g. AIza...)"
            type="password"
            value={keyDraft}
            onChange={(event) => setKeyDraft(event.target.value)}
            description="Your key is never shared with our servers outside of the requests you initiate."
          />
        </div>
        {keyError && (
          <div className="mt-4 rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {keyError}
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={closeKeyModal}
            disabled={isKeyProcessing}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveKey}
            isLoading={isKeyProcessing}
            disabled={isKeyProcessing}
          >
            Save key
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default PRDCreatorApp;
