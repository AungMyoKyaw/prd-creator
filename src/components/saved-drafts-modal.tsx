'use client';

import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  loadDrafts,
  deleteDraft,
  StoredDraft,
  migrateLocalStorageToIndexedDB
} from '@/lib/drafts';
import { Save, Calendar, Bot } from 'lucide-react';

interface SavedDraftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDraft: (draft: StoredDraft) => void;
}

export function SavedDraftsModal({
  isOpen,
  onClose,
  onLoadDraft
}: SavedDraftsModalProps) {
  const [drafts, setDrafts] = useState<StoredDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDraftsData();
      // Attempt migration on first load
      migrateLocalStorageToIndexedDB().catch(() => {});
    }
  }, [isOpen]);

  const loadDraftsData = async () => {
    setIsLoading(true);
    try {
      const loadedDrafts = await loadDrafts();
      setDrafts(loadedDrafts);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!confirm('Are you sure you want to delete this draft?')) {
      return;
    }

    setDeletingId(id);
    try {
      const updatedDrafts = await deleteDraft(id);
      setDrafts(updatedDrafts);
    } catch {
    } finally {
      setDeletingId(null);
    }
  };

  const handleLoadDraft = (draft: StoredDraft) => {
    onLoadDraft(draft);
    onClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100]" />
        <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white border-[3px] border-black shadow-[8px_8px_0px_#000] w-[95vw] max-w-3xl max-h-[85vh] overflow-hidden z-[101] focus:outline-none">
          <div className="flex flex-col h-full max-h-[85vh]">
            {/* Header */}
            <div className="p-6 border-b-[3px] border-black bg-[#FFEB3B]">
              <div className="flex justify-between items-center">
                <Dialog.Title
                  className="text-2xl font-black text-black uppercase tracking-wide"
                  style={{
                    fontFamily:
                      "'Big Shoulders Display', 'Impact', 'Arial Black', sans-serif"
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    Saved PRDs
                  </span>
                </Dialog.Title>
                <Dialog.Close className="text-black hover:text-gray-700 transition-colors">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </Dialog.Close>
              </div>
              <p className="text-black text-sm font-medium mt-2">
                {drafts.length} saved PRD{drafts.length !== 1 ? 's' : ''} (max
                12)
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent mb-4"></div>
                  <p className="text-black font-bold">Loading drafts...</p>
                </div>
              ) : drafts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg
                    className="w-16 h-16 text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold text-black mb-2">
                    No Saved PRDs
                  </h3>
                  <p className="text-gray-600 font-medium">
                    Generate and save your first PRD to see it here!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {drafts.map((draft) => (
                    <div
                      key={draft.id}
                      onClick={() => handleLoadDraft(draft)}
                      className="bg-white border-[3px] border-black shadow-[4px_4px_0px_#000] p-4 cursor-pointer transition-all duration-150 hover:shadow-[6px_6px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-black mb-1">
                            {draft.title}
                          </h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(draft.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bot className="w-3 h-3" />
                              {draft.model}
                            </span>
                          </div>
                          {draft.inputs.problemStatement && (
                            <p className="text-sm text-gray-700 font-medium mt-2 line-clamp-2">
                              {draft.inputs.problemStatement}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={(e) => handleDelete(draft.id, e)}
                          disabled={deletingId === draft.id}
                          className="ml-4 px-3 py-2 bg-[#F44336] text-white font-bold text-sm uppercase border-[3px] border-black shadow-[2px_2px_0px_#000] transition-all duration-150 hover:shadow-[4px_4px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-[1px_1px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete draft"
                        >
                          {deletingId === draft.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t-[3px] border-black bg-[#F5F5F5]">
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-white text-black font-bold uppercase tracking-wide border-[3px] border-black shadow-[4px_4px_0px_#000] transition-all duration-150 hover:shadow-[6px_6px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-[2px_2px_0px_#000] active:translate-x-[2px] active:translate-y-[2px]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
