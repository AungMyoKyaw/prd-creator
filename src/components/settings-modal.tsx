'use client';

import React, { useState, useEffect } from 'react';
import { GEMINI_MODELS } from '@/lib/models';
import { Settings, Check } from 'lucide-react';

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
  currentModel
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey: key })
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
    } catch {
      setModelsError('Could not fetch models. Using default list.');
      // Fallback to static list
      setModels(GEMINI_MODELS);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSave = () => {
    if (apiKey.trim()) {
      const selectedModelData = models.find((m) => m.value === model);
      const displayName =
        selectedModelData?.displayName || selectedModelData?.label || model;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border-[5px] border-black bg-white shadow-[12px_12px_0px_#000]">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between border-b-[3px] border-black pb-4">
            <h2
              className="text-3xl font-black tracking-tight text-black uppercase"
              style={{
                fontFamily:
                  "'Big Shoulders Display', 'Impact', 'Arial Black', sans-serif"
              }}
            >
              <span className="flex items-center gap-2">
                <Settings className="h-6 w-6" />
                SETTINGS
              </span>
            </h2>
            <button
              onClick={onClose}
              className="border-[3px] border-black p-2 text-black transition-all duration-150 hover:bg-[#F44336] hover:text-white"
              aria-label="Close"
            >
              <svg
                className="h-6 w-6"
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
          <div className="mb-8 space-y-6">
            <div>
              <label
                htmlFor="apiKey"
                className="mb-3 block text-sm font-bold tracking-wide text-black uppercase"
              >
                Gemini API Key <span className="text-[#E91E63]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  id="apiKey"
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  placeholder="Enter your Gemini API key"
                  className="w-full border-[3px] border-black bg-white px-4 py-3 pr-24 font-medium text-black placeholder-gray-500 shadow-[4px_4px_0px_#000] focus:border-[#2196F3] focus:shadow-[4px_4px_0px_#2196F3] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 border-[2px] border-black bg-[#FFEB3B] px-3 py-1 text-xs font-bold uppercase transition-colors hover:bg-[#FDD835]"
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
                  className="font-bold text-[#2196F3] underline hover:text-[#1976D2]"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            {/* Model Selection */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label
                  htmlFor="model"
                  className="block text-sm font-bold tracking-wide text-black uppercase"
                >
                  Model Selection
                </label>
                {loadingModels && (
                  <span className="flex items-center text-xs font-bold text-[#2196F3] uppercase">
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Fetching...
                  </span>
                )}
                {!loadingModels && models.length > GEMINI_MODELS.length && (
                  <span className="text-xs font-bold text-[#4CAF50] uppercase">
                    <span className="flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      {models.length} LOADED
                    </span>
                  </span>
                )}
              </div>

              {modelsError && (
                <div className="mb-3 border-[3px] border-black bg-[#FF9800] px-4 py-2 text-sm font-bold text-black">
                  {modelsError}
                </div>
              )}

              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={loadingModels}
                className="w-full border-[3px] border-black bg-white px-4 py-3 font-medium text-black shadow-[4px_4px_0px_#000] focus:border-[#2196F3] focus:shadow-[4px_4px_0px_#2196F3] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
                    Input limit:{' '}
                    {models
                      .find((m) => m.value === model)
                      ?.inputTokenLimit?.toLocaleString()}{' '}
                    tokens
                    {models.find((m) => m.value === model)?.outputTokenLimit &&
                      ` • Output limit: ${models.find((m) => m.value === model)?.outputTokenLimit?.toLocaleString()} tokens`}
                  </p>
                )}
              </div>
            </div>

            {/* Token Info */}
            <div className="border-[3px] border-black bg-[#2196F3] p-6 shadow-[4px_4px_0px_#000]">
              <div className="flex items-start">
                <svg
                  className="mt-0.5 mr-4 h-6 w-6 flex-shrink-0 text-white"
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
                  <h4 className="mb-2 text-base font-black text-white uppercase">
                    Unlimited Token Generation
                  </h4>
                  <p className="text-sm font-medium text-white">
                    Token limits are removed for maximum flexibility. The API
                    will generate as much content as needed for comprehensive
                    PRDs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 border-t-[3px] border-black pt-6">
            <button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="flex-1 border-[3px] border-black bg-[#FFEB3B] px-6 py-3 font-bold tracking-wide text-black uppercase shadow-[4px_4px_0px_#000] transition-all duration-150 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000] disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-[4px_4px_0px_#000]"
            >
              Save Settings
            </button>
            <button
              onClick={onClose}
              className="border-[3px] border-black bg-white px-6 py-3 font-bold tracking-wide text-black uppercase shadow-[4px_4px_0px_#000] transition-all duration-150 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
