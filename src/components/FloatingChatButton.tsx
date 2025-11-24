import React, { useState } from 'react';
import { BrainCircuit } from 'lucide-react';
import AICoachPage from '../pages/AICoachPage';

const FloatingChatButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        aria-label="Open AI Trade Coach"
      >
        <BrainCircuit className="w-6 h-6" />
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="relative w-full h-full max-w-4xl max-h-[90vh] bg-slate-800 rounded-lg shadow-2xl overflow-hidden">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-gray-300 hover:text-white transition-colors"
              aria-label="Close AI Trade Coach"
            >
              ✕
            </button>
            <AICoachPage />
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatButton;
