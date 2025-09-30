import { ChangeEvent } from "react";
import { Button } from "./button";
import { TextareaField } from "./textarea-field";

interface RefineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  sectionTitle: string;
  feedback: string;
  setFeedback: (value: string) => void;
  error?: string;
}

export function RefineModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  sectionTitle,
  feedback,
  setFeedback,
  error
}: RefineModalProps) {
  if (!isOpen) return null;

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
    setFeedback(event.target.value);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-900/50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-indigo-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.455-2.456L12.75 18l1.178-.398a3.375 3.375 0 002.455-2.456L16.5 14.25l.398 1.178a3.375 3.375 0 002.456 2.456L20.25 18l-1.178.398a3.375 3.375 0 00-2.456 2.456z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-white">
              Refine &ldquo;{sectionTitle}&rdquo;
            </h3>
            <div className="mt-4">
              <TextareaField
                label="Your Feedback"
                id="refineFeedback"
                value={feedback}
                onChange={handleChange}
                placeholder={`e.g., "Make the tone more formal" or "Add a feature for social media sharing."`}
                rows={4}
                description="Provide instructions for the AI to edit this section."
              />
            </div>
            {error ? (
              <div className="mt-3 bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-lg text-sm">
                <p>
                  <span className="font-bold">Error:</span> {error}
                </p>
              </div>
            ) : null}
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            onClick={onSubmit}
            isLoading={isLoading}
            disabled={isLoading || !feedback.trim()}
            className="sm:w-auto"
          >
            {isLoading ? "Refining..." : "Refine with AI"}
          </Button>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex justify-center rounded-md bg-slate-700 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
