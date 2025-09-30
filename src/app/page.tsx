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
import { SettingsModal } from '@/components/settings-modal';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';

export default function Home() {
  // Settings state
  const [apiKey, setApiKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');
  const [modelDisplayName, setModelDisplayName] = useState<string>('Gemini 2.5 Flash');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [showSetupPrompt, setShowSetupPrompt] = useState<boolean>(false);

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

  // Load settings from localStorage on mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem('gemini_api_key');
    const storedModel = localStorage.getItem('gemini_model');
    const storedModelDisplayName = localStorage.getItem('gemini_model_display_name');
    
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      setShowSetupPrompt(true);
    }
    
    if (storedModel) {
      setSelectedModel(storedModel);
    } else {
      // Set default to gemini-2.5-flash
      setSelectedModel('gemini-2.5-flash');
    }
    
    if (storedModelDisplayName) {
      setModelDisplayName(storedModelDisplayName);
    }
  }, []);

  useEffect(() => {
    setLivePreviewContent(generatePreviewMarkdown(prdInput));
  }, [prdInput]);

  const handleSaveSettings = (newApiKey: string, newModel: string, newModelDisplayName?: string) => {
    setApiKey(newApiKey);
    setSelectedModel(newModel);
    if (newModelDisplayName) {
      setModelDisplayName(newModelDisplayName);
    }
    localStorage.setItem('gemini_api_key', newApiKey);
    localStorage.setItem('gemini_model', newModel);
    if (newModelDisplayName) {
      localStorage.setItem('gemini_model_display_name', newModelDisplayName);
    }
    setShowSetupPrompt(false);
  };

  const handlePrefillInputs = async () => {
    if (!productIdea.trim()) {
      setPrefillError('Please enter a product idea to prefill the form.');
      return;
    }

    if (!apiKey) {
      setPrefillError('Please configure your API key in settings first.');
      setIsSettingsOpen(true);
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
        body: JSON.stringify({ 
          productIdea,
          apiKey,
          model: selectedModel,
        }),
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

    if (!apiKey) {
      setGenerateError('Please configure your API key in settings first.');
      setIsSettingsOpen(true);
      return;
    }

    setIsGenerating(true);
    setGenerateError('');
    setGeneratedPrd('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          inputs: prdInput,
          apiKey,
          model: selectedModel,
        }),
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

    if (!apiKey) {
      setRefineError('Please configure your API key in settings first.');
      setIsSettingsOpen(true);
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
          apiKey,
          model: selectedModel,
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
      <Header 
        onSettingsClick={() => setIsSettingsOpen(true)} 
        currentModel={selectedModel}
        modelDisplayName={modelDisplayName}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Setup Prompt Banner */}
          {showSetupPrompt && (
            <div className="mb-6 bg-indigo-900/50 border border-indigo-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 text-indigo-400 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-white font-medium">Welcome! Setup Required</h3>
                    <p className="text-indigo-300 text-sm">
                      Please configure your Gemini API key to get started.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Open Settings
                </button>
              </div>
            </div>
          )}

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
                <PRDDisplay 
                  content={generatedPrd} 
                  productName={prdInput.productName || 'PRD'}
                />
              )}
              
              {!generatedPrd && !isGenerating && (
                <>
                  <PRDDisplay 
                    content={livePreviewContent} 
                    isLivePreview 
                    productName={prdInput.productName || 'PRD'}
                  />
                  
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

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        currentApiKey={apiKey}
        currentModel={selectedModel}
      />

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
