'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { PrdInput, DEFAULT_PRD_INPUT, generatePreviewMarkdown } from '@/lib/prd';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { PRDForm } from '@/components/prd-form';
import { PRDDisplay } from '@/components/prd-display';
import { Loader } from '@/components/loader';
import { TextareaField } from '@/components/textarea-field';
import { Button } from '@/components/button';
import { RefineModal } from '@/components/refine-modal';

export default function Home() {
  const [productIdea, setProductIdea] = useState<string>('');
  const [isPrefilling, setIsPrefilling] = useState<boolean>(false);
  const [prefillError, setPrefillError] = useState<string>('');

  const [prdInput, setPrdInput] = useState<PrdInput>(DEFAULT_PRD_INPUT);

  const [generatedPrd, setGeneratedPrd] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generateError, setGenerateError] = useState<string>('');
  const [livePreviewContent, setLivePreviewContent] = useState<string>('');

  // State for the refinement modal
  const [refiningSection, setRefiningSection] = useState<string>('');
  const [refineFeedback, setRefineFeedback] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState('');

  useEffect(() => {
    setLivePreviewContent(generatePreviewMarkdown(prdInput));
  }, [prdInput]);

  const handlePrefillInputs = async () => {
    if (!productIdea.trim()) {
      setPrefillError('Please enter a product idea to prefill the form.');
      return;
    }

    setIsPrefilling(true);
    setPrefillError('');

    try {
      const response = await fetch('/api/prefill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productIdea }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to prefill inputs');
      }

      const { data } = await response.json();
      setPrdInput(data);
      setPrefillError('');
    } catch (err) {
      console.error('Error prefilling inputs:', err);
      setPrefillError(err instanceof Error ? err.message : 'An error occurred while prefilling inputs.');
    } finally {
      setIsPrefilling(false);
    }
  };

  const handleGeneratePRD = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsGenerating(true);
    setGenerateError('');
    setGeneratedPrd('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: prdInput }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PRD');
      }

      const { data } = await response.json();
      setGeneratedPrd(data);
    } catch (err) {
      console.error('Error generating PRD:', err);
      setGenerateError(err instanceof Error ? err.message : 'An error occurred while generating the PRD.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefineSection = async () => {
    if (!refiningSection || !refineFeedback.trim()) {
      setRefineError('Please provide feedback for refinement.');
      return;
    }

    setIsRefining(true);
    setRefineError('');

    try {
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentInputs: prdInput,
          sectionTitle: refiningSection,
          userFeedback: refineFeedback,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to refine section');
      }

      const { data } = await response.json();
      setPrdInput((prev) => ({ ...prev, ...data }));
      setRefiningSection('');
      setRefineFeedback('');
      setRefineError('');
    } catch (err) {
      console.error('Error refining section:', err);
      setRefineError(err instanceof Error ? err.message : 'An error occurred while refining the section.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleReset = () => {
    setProductIdea('');
    setPrdInput(DEFAULT_PRD_INPUT);
    setGeneratedPrd('');
    setGenerateError('');
    setPrefillError('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Product Idea Prefill Section */}
          <div className="mb-8 bg-slate-800/50 rounded-lg border border-slate-700 shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">
              ✨ Quick Start: Describe Your Product Idea
            </h2>
            <div className="space-y-4">
              <TextareaField
                label="Product Idea"
                id="productIdea"
                value={productIdea}
                onChange={(e) => setProductIdea(e.target.value)}
                placeholder="Describe your product idea in a few sentences... e.g., 'A mobile app that helps people find and book local fitness classes'"
                rows={3}
              />
              {prefillError && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-lg text-sm">
                  {prefillError}
                </div>
              )}
              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={handlePrefillInputs}
                  isLoading={isPrefilling}
                  loadingLabel="Prefilling..."
                  disabled={isPrefilling || !productIdea.trim()}
                >
                  Auto-fill Form with AI ✨
                </Button>
                {(prdInput.productName || generatedPrd) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-3 rounded-md text-base font-medium text-white bg-slate-700 hover:bg-slate-600 transition-colors"
                  >
                    Reset Form
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div className="space-y-6">
              <PRDForm
                prdInput={prdInput}
                setPrdInput={setPrdInput}
                onSubmit={handleGeneratePRD}
                isLoading={isGenerating}
                onRefineSection={(sectionTitle) => {
                  setRefiningSection(sectionTitle);
                  setRefineFeedback('');
                  setRefineError('');
                }}
              />
              
              {generateError && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-sm">
                  <p className="font-bold">Error:</p>
                  <p>{generateError}</p>
                </div>
              )}
            </div>

            {/* Right Column - Output */}
            <div className="space-y-6">
              {isGenerating && <Loader />}
              
              {generatedPrd && !isGenerating && (
                <PRDDisplay content={generatedPrd} />
              )}
              
              {!generatedPrd && !isGenerating && (
                <>
                  <PRDDisplay content={livePreviewContent} isLivePreview />
                  
                  <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6 text-center">
                    <div className="text-slate-400 mb-4">
                      <svg
                        className="mx-auto h-12 w-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      Preview Mode
                    </h3>
                    <p className="text-slate-400">
                      Fill in the form and click &quot;Generate PRD&quot; to create your complete document.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Refine Modal */}
      <RefineModal
        isOpen={refiningSection !== ''}
        onClose={() => {
          setRefiningSection('');
          setRefineFeedback('');
          setRefineError('');
        }}
        onSubmit={handleRefineSection}
        isLoading={isRefining}
        sectionTitle={refiningSection}
        feedback={refineFeedback}
        setFeedback={setRefineFeedback}
        error={refineError}
      />
    </div>
  );
}
