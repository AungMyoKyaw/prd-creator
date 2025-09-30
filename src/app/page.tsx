'use client';

import React from 'react';
import PRDCreatorApp from '../components/PRDCreatorApp';
import ErrorBoundary from '../components/ErrorBoundary';

export default function Home() {
  return (
    <ErrorBoundary>
      <PRDCreatorApp />
    </ErrorBoundary>
  );
}
