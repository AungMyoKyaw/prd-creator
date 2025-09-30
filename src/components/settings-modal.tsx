'use client';

import React, { useState, useEffect } from 'react';
import { GEMINI_MODELS } from '@/lib/models';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string, model: string) => void;
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

  useEffect(() => {
    setApiKey(currentApiKey);
    setModel(currentModel);
  }, [currentApiKey, currentModel, isOpen]);

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim(), model);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">⚙️ Settings</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* API Key Section */}
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-white mb-2">
                Gemini API Key *
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="w-full px-4 py-3 pr-24 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  {showApiKey ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Get your API key from{' '}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            {/* Model Selection */}
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-white mb-2">
                Model Selection
              </label>
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {GEMINI_MODELS.map((modelOption) => (
                  <option key={modelOption.value} value={modelOption.value}>
                    {modelOption.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-slate-400">
                {GEMINI_MODELS.find((m) => m.value === model)?.description}
              </p>
            </div>

            {/* Token Info */}
            <div className="bg-indigo-900/20 border border-indigo-700/50 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-indigo-400 mt-0.5 mr-3"
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
                  <h4 className="text-sm font-medium text-indigo-400 mb-1">
                    Unlimited Token Generation
                  </h4>
                  <p className="text-sm text-slate-400">
                    Token limits are removed for maximum flexibility. The API will generate as much content as needed for comprehensive PRDs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-slate-700">
            <button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
            >
              Save Settings
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
