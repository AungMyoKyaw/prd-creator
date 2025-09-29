import { useCallback, useEffect, useState } from 'react';
import {
  decryptValue,
  encryptValue,
  isSecureStorageSupported
} from '../lib/secureStorage';

const STORAGE_KEY = 'prdCreatorGeminiKey';

interface GeminiKeyState {
  apiKey: string | null;
  hasKey: boolean;
  isReady: boolean;
  isProcessing: boolean;
  error: string | null;
  saveKey: (value: string) => Promise<void>;
  clearKey: () => Promise<void>;
  resetError: () => void;
}

export function useGeminiKey(): GeminiKeyState {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (typeof window === 'undefined') {
      return () => {
        isMounted = false;
      };
    }

    const hydrate = async () => {
      try {
        if (!isSecureStorageSupported()) {
          setError(
            'Secure storage is unavailable in this browser. Please use the API key inline for each session.'
          );
          return;
        }

        const storedValue = window.localStorage.getItem(STORAGE_KEY);
        if (!storedValue) {
          return;
        }

        const decrypted = await decryptValue(storedValue);
        if (isMounted) {
          setApiKey(decrypted);
        }
      } catch (err) {
        console.error('Failed to hydrate Gemini API key', err);
        if (isMounted) {
          setError(
            "We couldn't restore your saved Gemini key. Please re-enter it."
          );
          window.localStorage.removeItem(STORAGE_KEY);
        }
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveKey = useCallback(async (value: string) => {
    if (typeof window === 'undefined') {
      throw new Error('API key storage is only available in the browser.');
    }

    const normalized = value.trim();
    if (!normalized) {
      throw new Error('Please provide a valid Gemini API key.');
    }

    if (!isSecureStorageSupported()) {
      throw new Error('Secure storage is unavailable in this browser.');
    }

    setIsProcessing(true);
    setError(null);

    try {
      const encrypted = await encryptValue(normalized);
      window.localStorage.setItem(STORAGE_KEY, encrypted);
      setApiKey(normalized);
    } catch (err) {
      console.error('Unable to store Gemini API key', err);
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      }
      const fallbackError = new Error(
        'Unexpected error while saving the Gemini API key.'
      );
      setError(fallbackError.message);
      throw fallbackError;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clearKey = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      setApiKey(null);
    } catch (err) {
      console.error('Unable to clear Gemini API key', err);
      const fallbackMessage =
        "We couldn't remove the saved API key. Please clear your browser storage manually.";
      setError(fallbackMessage);
      throw err instanceof Error ? err : new Error(fallbackMessage);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    apiKey,
    hasKey: Boolean(apiKey),
    isReady,
    isProcessing,
    error,
    saveKey,
    clearKey,
    resetError
  };
}
