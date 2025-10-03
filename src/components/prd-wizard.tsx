'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, Edit3, FileText } from 'lucide-react';
import {
  PrdInput,
  DEFAULT_PRD_INPUT,
  generatePreviewMarkdown
} from '@/lib/prd';
import { Button } from './button';
import { Loader } from './loader';
import { TextareaField } from './textarea-field';
import { PRDDisplay } from './prd-display';

interface PRDWizardProps {
  apiKey: string;
  selectedModel: string;
  modelDisplayName: string;
  onGeneratedPRD: (prd: string, inputs: PrdInput) => void;
  onFullPageView?: () => void;
  currentStep?: 1 | 2 | 3;
  setCurrentStep?: (step: 1 | 2 | 3) => void;
  generatedPrd?: string;
  prdInput?: PrdInput;
  onResetState?: () => void;
}

export function PRDWizard({
  apiKey,
  selectedModel,
  modelDisplayName,
  onGeneratedPRD,
  onFullPageView,
  currentStep: externalCurrentStep,
  setCurrentStep: externalSetCurrentStep,
  generatedPrd: externalGeneratedPrd,
  prdInput: externalPrdInput,
  onResetState
}: PRDWizardProps) {
  // Use external state if provided (when loading from saved drafts), otherwise use internal state
  const [internalCurrentStep, setInternalCurrentStep] = useState<1 | 2 | 3>(1);
  const [internalPrdInput, setInternalPrdInput] =
    useState<PrdInput>(DEFAULT_PRD_INPUT);
  const [internalGeneratedPrd, setInternalGeneratedPrd] = useState<string>('');

  const currentStep = externalCurrentStep ?? internalCurrentStep;
  const setCurrentStep = externalSetCurrentStep ?? setInternalCurrentStep;
  const prdInput = externalPrdInput ?? internalPrdInput;
  const setPrdInput = externalPrdInput ? () => {} : setInternalPrdInput;
  const generatedPrd = externalGeneratedPrd ?? internalGeneratedPrd;
  const setGeneratedPrd = externalGeneratedPrd
    ? () => {}
    : setInternalGeneratedPrd;

  const [productIdea, setProductIdea] = useState<string>('');
  const [isPrefilling, setIsPrefilling] = useState<boolean>(false);
  const [prefillError, setPrefillError] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generateError, setGenerateError] = useState<string>('');

  const steps = [
    {
      id: 1,
      title: 'Idea Entry',
      description: 'Describe your product idea',
      icon: Sparkles
    },
    {
      id: 2,
      title: 'Auto-fill & Edit',
      description: 'Review and customize details',
      icon: Edit3
    },
    {
      id: 3,
      title: 'PRD Preview',
      description: 'Your generated document',
      icon: FileText
    }
  ];

  const handleIdeaSubmit = async () => {
    if (!productIdea.trim()) return;

    setIsPrefilling(true);
    setPrefillError('');

    try {
      const response = await fetch('/api/prefill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productIdea: productIdea.trim(),
          apiKey,
          model: selectedModel
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to prefill form');
      }

      const { data } = await response.json();
      if (externalPrdInput) {
        // If using external state, do nothing - parent will handle
      } else {
        setInternalPrdInput(data);
      }
      setCurrentStep(2);
    } catch (err) {
      console.error('Error prefilling form:', err);
      setPrefillError(
        err instanceof Error
          ? err.message
          : 'An error occurred while prefilling the form.'
      );
    } finally {
      setIsPrefilling(false);
    }
  };

  const handleGeneratePRD = async () => {
    setIsGenerating(true);
    setGenerateError('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prdInput,
          apiKey,
          model: selectedModel
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PRD');
      }

      const { data } = await response.json();
      if (externalGeneratedPrd) {
        // If using external state, do nothing - parent will handle
      } else {
        setInternalGeneratedPrd(data.prd);
      }
      onGeneratedPRD(data.prd, prdInput);
      setCurrentStep(3);
    } catch (err) {
      console.error('Error generating PRD:', err);
      setGenerateError(
        err instanceof Error
          ? err.message
          : 'An error occurred while generating the PRD.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (event) => {
    const { name, value } = event.target;
    if (externalPrdInput) {
      // If using external state, do nothing - parent will handle
    } else {
      setInternalPrdInput((previous) => ({ ...previous, [name]: value }));
    }
  };

  const canGoToStep2 = productIdea.trim().length > 0;
  const canGoToStep3 =
    prdInput.productName.trim().length > 0 &&
    prdInput.problemStatement.trim().length > 0;

  const handleNext = () => {
    if (currentStep === 1 && canGoToStep2) {
      handleIdeaSubmit();
    } else if (currentStep === 2 && canGoToStep3) {
      handleGeneratePRD();
    } else if (currentStep === 3) {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as 1 | 2);
    }
  };

  const handleFullPageView = () => {
    if (onFullPageView) {
      onFullPageView();
    }
  };

  const handleFinish = () => {
    // Reset to step 1 to start a new idea
    setCurrentStep(1);
    setProductIdea('');
    if (externalPrdInput) {
      // If using external state, notify parent to reset
      onResetState?.();
    } else {
      setInternalPrdInput(DEFAULT_PRD_INPUT);
    }
    if (externalGeneratedPrd) {
      // If using external state, notify parent to reset
      onResetState?.();
    } else {
      setInternalGeneratedPrd('');
    }
    setPrefillError('');
    setGenerateError('');
  };

  const handleStepClick = (stepId: number) => {
    if (stepId === 1) {
      setCurrentStep(1);
      // Reset to fresh state when going back to step 1 from a loaded draft
      if (externalPrdInput && currentStep === 3) {
        onResetState?.();
      }
    } else if (stepId === 2 && canGoToStep2) {
      setCurrentStep(2);
    } else if (stepId === 3 && canGoToStep3) {
      setCurrentStep(3);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="relative">
          {/* Background Progress Line */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-gray-300">
            <div
              className="h-1 bg-[#4CAF50] transition-all duration-500"
              style={{
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
              }}
            />
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = step.id < currentStep;
              const isClickable =
                step.id === 1 ||
                (step.id === 2 && canGoToStep2) ||
                (step.id === 3 && canGoToStep3);

              return (
                <div key={step.id} className="flex flex-col items-center">
                  <button
                    onClick={() => isClickable && handleStepClick(step.id)}
                    disabled={!isClickable}
                    className={`
                      relative z-10 flex items-center justify-center w-14 h-14 rounded-full border-[4px] transition-all duration-300 transform
                      ${
                        isActive
                          ? 'bg-[#FFEB3B] border-black shadow-[6px_6px_0px_#000] scale-110'
                          : isCompleted
                            ? 'bg-[#4CAF50] border-black shadow-[4px_4px_0px_#000] hover:scale-105'
                            : isClickable
                              ? 'bg-white border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:scale-105'
                              : 'bg-gray-200 border-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    <Icon
                      className={`w-7 h-7 ${isActive || isCompleted ? 'text-black' : 'text-gray-500'}`}
                    />
                    {isCompleted && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 bg-black rounded-full"></div>
                      </div>
                    )}
                  </button>
                  <div className="mt-4 text-center">
                    <p
                      className={`text-sm font-bold uppercase tracking-wide ${
                        isActive
                          ? 'text-black'
                          : isCompleted
                            ? 'text-[#4CAF50]'
                            : 'text-gray-500'
                      }`}
                      style={{
                        fontFamily:
                          "'Big Shoulders Display', 'Impact', 'Arial Black', sans-serif"
                      }}
                    >
                      {step.title}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        isActive ? 'text-black' : 'text-gray-500'
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Model Info */}
      <div className="mb-6 flex justify-center">
        <div className="inline-flex items-center px-4 py-2 bg-[#FFEB3B] border-[4px] border-black shadow-[4px_4px_0px_#000] model-info-badge">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-[#4CAF50] rounded-full animate-pulse"></div>
            <div className="text-left">
              <p className="text-xs font-bold text-black uppercase">
                Currently Using:
              </p>
              <p className="text-sm font-black">
                {modelDisplayName || selectedModel}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Navigation Bar */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t-[4px] border-black shadow-[0_-4px_0px_#000] z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3"
            >
              <ArrowLeft className="w-5 h-5" />
              Previous
            </Button>

            <div className="flex items-center gap-4 text-lg font-bold text-black">
              <span>Step {currentStep}</span>
              <span className="text-gray-500">of {steps.length}</span>
            </div>

            <Button
              variant="secondary"
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !canGoToStep2) ||
                (currentStep === 2 && isGenerating)
              }
              isLoading={isPrefilling || isGenerating}
              className="flex items-center gap-2 px-6 py-3"
            >
              {currentStep === 3 ? 'Start New Idea' : 'Next'}
              {currentStep < 3 && <ArrowRight className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[500px] bg-white border-[4px] border-black shadow-[6px_6px_0px_#000] rounded-none p-8 pb-20">
        {currentStep === 1 && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFEB3B] border-[4px] border-black shadow-[4px_4px_0px_#000] mb-6">
                <Sparkles className="w-8 h-8 text-black" />
              </div>
              <h2
                className="text-4xl font-black text-black mb-4 uppercase tracking-wide"
                style={{
                  fontFamily:
                    "'Big Shoulders Display', 'Impact', 'Arial Black', sans-serif"
                }}
              >
                What&apos;s Your Product Idea?
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                Tell us about your product in a few sentences, and we&apos;ll
                help you build a comprehensive PRD.
              </p>
            </div>

            <div className="space-y-4">
              <TextareaField
                label="Product Idea"
                id="productIdea"
                name="productIdea"
                value={productIdea}
                onChange={(e) => setProductIdea(e.target.value)}
                placeholder="e.g., A mobile app that helps remote workers find and book coworking spaces with real-time availability..."
                rows={8}
                description="Describe your product concept, target users, and key features in your own words."
              />
            </div>

            {prefillError && (
              <div className="bg-[#F44336] border-[4px] border-black text-white p-6 shadow-[4px_4px_0px_#000]">
                <p className="font-bold uppercase tracking-wide mb-2">Error:</p>
                <p className="font-medium">{prefillError}</p>
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#2196F3] border-[4px] border-black shadow-[4px_4px_0px_#000] mb-6">
                <Edit3 className="w-8 h-8 text-white" />
              </div>
              <h2
                className="text-4xl font-black text-black mb-4 uppercase tracking-wide"
                style={{
                  fontFamily:
                    "'Big Shoulders Display', 'Impact', 'Arial Black', sans-serif"
                }}
              >
                Review & Customize Details
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                We&apos;ve pre-filled your PRD based on your idea. Review and
                edit any section as needed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide text-black mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    id="productName"
                    name="productName"
                    value={prdInput.productName}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-white border-[3px] border-black shadow-[4px_4px_0px_#000] text-black placeholder-gray-500 font-medium transition-all duration-150 focus:outline-none focus:border-[#2196F3] focus:shadow-[4px_4px_0px_#2196F3] focus:translate-x-[-1px] focus:translate-y-[-1px]"
                    placeholder="e.g., Apollo - The AI Trip Planner"
                  />
                </div>

                <TextareaField
                  label="Problem Statement"
                  id="problemStatement"
                  name="problemStatement"
                  value={prdInput.problemStatement}
                  onChange={handleChange}
                  placeholder="What problem does your product solve?"
                  rows={6}
                />
              </div>

              <div className="space-y-6">
                <TextareaField
                  label="Target Audience"
                  id="targetAudience"
                  name="targetAudience"
                  value={prdInput.targetAudience}
                  onChange={handleChange}
                  placeholder="Who are your target users?"
                  rows={6}
                />

                <TextareaField
                  label="Key Features"
                  id="keyFeatures"
                  name="keyFeatures"
                  value={prdInput.keyFeatures}
                  onChange={handleChange}
                  placeholder="What are the main features that differentiate your product?"
                  rows={6}
                  description="List the key differentiating features that make your product unique and valuable."
                />
              </div>

              <div className="md:col-span-2">
                <TextareaField
                  label="Success Metrics"
                  id="successMetrics"
                  name="successMetrics"
                  value={prdInput.successMetrics}
                  onChange={handleChange}
                  placeholder="How will you measure success?"
                  rows={4}
                  description="Define specific, measurable KPIs and targets to track product success (e.g., User retention > 40%, 10k MAU in 6 months)."
                />
              </div>
            </div>

            {generateError && (
              <div className="bg-[#F44336] border-[4px] border-black text-white p-6 shadow-[4px_4px_0px_#000]">
                <p className="font-bold uppercase tracking-wide mb-2">Error:</p>
                <p className="font-medium">{generateError}</p>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4CAF50] border-[4px] border-black shadow-[4px_4px_0px_#000] mb-6">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h2
                className="text-4xl font-black text-black mb-4 uppercase tracking-wide"
                style={{
                  fontFamily:
                    "'Big Shoulders Display', 'Impact', 'Arial Black', sans-serif"
                }}
              >
                Your PRD is Ready!
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                Here&apos;s your generated Product Requirements Document. You
                can download it, copy it, or view in full page mode.
              </p>
            </div>

            {isGenerating ? (
              <div className="flex justify-center py-16">
                <Loader />
              </div>
            ) : (
              <PRDDisplay
                content={generatedPrd}
                productName={prdInput.productName || 'PRD'}
                prdInputs={prdInput}
                model={selectedModel}
                onFullPageView={handleFullPageView}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
