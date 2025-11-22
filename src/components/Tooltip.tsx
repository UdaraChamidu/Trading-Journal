import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { ictTooltips } from '../lib/tooltips';

interface TooltipProps {
  term: string;
  children?: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ term, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const description = ictTooltips[term];

  if (!description) {
    return children ? <>{children}</> : null;
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors ml-1"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-gray-200 shadow-lg z-50">
          <p>{description}</p>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>
        </div>
      )}
    </div>
  );
};

interface LabelWithTooltipProps {
  label: string;
  term?: string;
  required?: boolean;
}

export const LabelWithTooltip: React.FC<LabelWithTooltipProps> = ({ label, term, required = false }) => {
  return (
    <label className="block text-sm font-medium text-gray-300 mb-2">
      <span>
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      {term && <Tooltip term={term} />}
    </label>
  );
};
