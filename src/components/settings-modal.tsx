'use client';

import React, { useState, useEffect } from 'react';
import { GEMINI_MODELS } from '@/lib/models';

interface Model {
  value: string;
  label: string;
  description: string;
  displayName?: string;
  inputTokenLimit?: number | null;
  outputTokenLimit?: number | null;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string, model: string, modelDisplayName?: string) => void;
  currentApiKey: string;
  currentModel: string;
}

export function SettingsModal({
  isOpen,
  onClose,
  onSave,
  currentApiKey,
  currentModel,
}: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(currentApiKey);
  const [model, setModel] = useState(currentModel);
  const [showApiKey, setShowApiKey] = useState(false);
  const [models, setModels] = useState<Model[]>(GEMINI_MODELS);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelsError, setModelsError] = useState('');

  useEffect(() => {
    setApiKey(currentApiKey);
    setModel(currentModel);
  }, [currentApiKey, currentModel, isOpen]);

  // Fetch models when API key is entered and modal is opened
  useEffect(() => {
    if (isOpen && apiKey && apiKey.trim().length > 20) {
      fetchModels(apiKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, apiKey]);

  const fetchModels = async (key: string) => {
    setLoadingModels(true);
    setModelsError('');

    try {
      const response = await fetch('/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: key }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }

      const data = await response.json();
      
      if (data.models && data.models.length > 0) {
        setModels(data.models);
        // If current model is not in the list, select the first one
        if (!data.models.find((m: Model) => m.value === model)) {
          setModel(data.models[0].value);
        }
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      setModelsError('Could not fetch models. Using default list.');
      // Fallback to static list
      setModels(GEMINI_MODELS);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSave = () => {
    if (apiKey.trim()) {
      const selectedModelData = models.find(m => m.value === model);
      const displayName = selectedModelData?.displayName || selectedModelData?.label || model;
      onSave(apiKey.trim(), model, displayName);
      onClose();
    }
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    
    // Auto-fetch models when API key looks valid (basic length check)
    if (newKey.trim().length > 20) {
      // Debounce the fetch
      const timeoutId = setTimeout(() => {
        fetchModels(newKey);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white border-[5px] border-black shadow-[12px_12px_0px_#000] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 border-b-[3px] border-black pb-4">
            <h2 
              className="text-3xl font-black text-black uppercase tracking-tight"
              style={{ fontFamily: "'Big Shoulders Display', 'Impact', 'Arial Black', sans-serif" }}
            >
              ⚙️ SETTINGS
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-black hover:bg-[#F44336] hover:text-white border-[3px] border-black transition-all duration-150"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* API Key Section */}
          <div className="space-y-6 mb-8">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-bold uppercase tracking-wide text-black mb-3">
                Gemini API Key <span className="text-[#E91E63]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  id="apiKey"
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  placeholder="Enter your Gemini API key"
                  className="w-full px-4 py-3 pr-24 bg-white border-[3px] border-black shadow-[4px_4px_0px_#000] text-black placeholder-gray-500 font-medium focus:outline-none focus:border-[#2196F3] focus:shadow-[4px_4px_0px_#2196F3]"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-bold uppercase bg-[#FFEB3B] border-[2px] border-black hover:bg-[#FDD835] transition-colors"
                >
                  {showApiKey ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="mt-3 text-sm font-medium text-gray-700">
                Get your API key from{' '}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2196F3] font-bold underline hover:text-[#1976D2]"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            {/* Model Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label htmlFor="model" className="block text-sm font-bold uppercase tracking-wide text-black">
                  Model Selection
                </label>
                {loadingModels && (
                  <span className="text-xs font-bold text-[#2196F3] flex items-center uppercase">
                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Fetching...
                  </span>
                )}
                {!loadingModels && models.length > GEMINI_MODELS.length && (
                  <span className="text-xs font-bold text-[#4CAF50] uppercase">✓ {models.length} LOADED</span>
                )}
              </div>
              
              {modelsError && (
                <div className="mb-3 text-sm font-bold text-black bg-[#FF9800] border-[3px] border-black px-4 py-2">
                  {modelsError}
                </div>
              )}
              
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={loadingModels}
                className="w-full px-4 py-3 bg-white border-[3px] border-black shadow-[4px_4px_0px_#000] text-black font-medium focus:outline-none focus:border-[#2196F3] focus:shadow-[4px_4px_0px_#2196F3] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {models.map((modelOption) => (
                  <option key={modelOption.value} value={modelOption.value}>
                    {modelOption.displayName || modelOption.label}
                  </option>
                ))}
              </select>
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  {models.find((m) => m.value === model)?.description}
                </p>
                {models.find((m) => m.value === model)?.inputTokenLimit && (
                  <p className="text-xs font-medium text-gray-600">
                    Input limit: {models.find((m) => m.value === model)?.inputTokenLimit?.toLocaleString()} tokens
                    {models.find((m) => m.value === model)?.outputTokenLimit && 
                      ` • Output limit: ${models.find((m) => m.value === model)?.outputTokenLimit?.toLocaleString()} tokens`
                    }
                  </p>
                )}
              </div>
            </div>

            {/* Token Info */}
            <div className="bg-[#2196F3] border-[3px] border-black shadow-[4px_4px_0px_#000] p-6">
              <div className="flex items-start">
                <svg
                  className="w-6 h-6 text-white mt-0.5 mr-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h4 className="text-base font-black text-white mb-2 uppercase">
                    Unlimited Token Generation
                  </h4>
                  <p className="text-sm font-medium text-white">
                    Token limits are removed for maximum flexibility. The API will generate as much content as needed for comprehensive PRDs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t-[3px] border-black">
            <button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="flex-1 px-6 py-3 bg-[#FFEB3B] text-black font-bold uppercase tracking-wide border-[3px] border-black shadow-[4px_4px_0px_#000] transition-all duration-150 hover:shadow-[6px_6px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-[2px_2px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[4px_4px_0px_#000]"
            >
              Save Settings
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white text-black font-bold uppercase tracking-wide border-[3px] border-black shadow-[4px_4px_0px_#000] transition-all duration-150 hover:shadow-[6px_6px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-[2px_2px_0px_#000] active:translate-x-[2px] active:translate-y-[2px]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
