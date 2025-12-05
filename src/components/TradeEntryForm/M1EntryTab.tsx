import React from 'react';
import { LabelWithTooltip } from '../Tooltip';

interface M1EntryTabProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

export const M1EntryTab: React.FC<M1EntryTabProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <LabelWithTooltip label="1min CHoCH" term="CHOCH" />
        <div className="flex gap-4 mt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="m1_choch"
              checked={data.m1_choch === false}
              onChange={() => onChange('m1_choch', false)}
              className="w-4 h-4"
            />
            <span className="text-gray-300">No</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="m1_choch"
              checked={data.m1_choch === true}
              onChange={() => onChange('m1_choch', true)}
              className="w-4 h-4"
            />
            <span className="text-gray-300">Yes</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <LabelWithTooltip label="Entry Type" term="entry" />
          <select
            value={data.m1_entry_type || ''}
            onChange={(e) => onChange('m1_entry_type', e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Select entry type</option>
            <option value="Order Block">Order Block</option>
            <option value="FVG">FVG</option>
            <option value="Golden Ratio only">Golden Ratio only (Good)</option>
            <option value="OB/FVG">OB/FVG (Bonus)</option>
          </select>
        </div>

        <div>
          <LabelWithTooltip label="1min Golden Ratio Reached" />
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="m1_golden_ratio"
                checked={data.m1_golden_ratio === false}
                onChange={() => onChange('m1_golden_ratio', false)}
                className="w-4 h-4"
              />
              <span className="text-gray-300">No</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="m1_golden_ratio"
                checked={data.m1_golden_ratio === true}
                onChange={() => onChange('m1_golden_ratio', true)}
                className="w-4 h-4"
              />
              <span className="text-gray-300">Yes</span>
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <LabelWithTooltip label="Entry Count" />
          <select
            value={data.m1_entry_count || ''}
            onChange={(e) => onChange('m1_entry_count', e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Select count</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
      </div>

      <div>
        <LabelWithTooltip label="Notes" />
        <textarea
          value={data.m1_notes || ''}
          onChange={(e) => onChange('m1_notes', e.target.value)}
          placeholder="Add any relevant entry notes..."
          rows={4}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
};
