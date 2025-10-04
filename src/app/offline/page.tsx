'use client';

import { Button } from '@/components/button';
import { useEffect, useState } from 'react';

export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      window.location.reload();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      // Try to fetch a simple endpoint to check connectivity
      const response = await fetch('/');
      if (response.ok) {
        window.location.reload();
      }
    } catch {
      setIsRetrying(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          You&apos;re Offline
        </h1>

        <p className="text-slate-600 mb-8">
          It looks like you&apos;ve lost your internet connection. Some features
          may not be available until you&apos;re back online.
        </p>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="font-semibold text-blue-900 mb-2">
              Available Offline
            </h2>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>&bull; View previously generated PRDs</li>
              <li>&bull; Access saved drafts</li>
              <li>&bull; Edit form fields</li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h2 className="font-semibold text-amber-900 mb-2">
              Requires Internet
            </h2>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>&bull; Generate new PRDs with AI</li>
              <li>&bull; Refine existing documents</li>
              <li>&bull; Sync with cloud</li>
            </ul>
          </div>
        </div>

        <Button
          onClick={handleRetry}
          disabled={isRetrying}
          className="w-full mt-8"
        >
          {isRetrying ? 'Checking Connection...' : 'Try Again'}
        </Button>

        <p className="text-xs text-slate-500 mt-4">
          This page will automatically refresh when your connection is restored.
        </p>
      </div>
    </div>
  );
}
