import React from 'react';
import { LabelWithTooltip } from '../Tooltip';

interface M15ConfirmationTabProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

export const M15ConfirmationTab: React.FC<M15ConfirmationTabProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <LabelWithTooltip label="CHoCH Confirmed" term="CHOCH" />
        <div className="flex gap-4 mt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="m15_choch"
              checked={data.m15_choch === false}
              onChange={() => onChange('m15_choch', false)}
              className="w-4 h-4"
            />
            <span className="text-gray-300">No</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="m15_choch"
              checked={data.m15_choch === true}
              onChange={() => onChange('m15_choch', true)}
              className="w-4 h-4"
            />
            <span className="text-gray-300">Yes</span>
          </label>
        </div>
      </div>

      {data.m15_choch && (
        <div>
          <LabelWithTooltip label="CHoCH Price Level" />
          <input
            type="number"
            step="0.01"
            value={data.m15_choch_price || ''}
            onChange={(e) => onChange('m15_choch_price', e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="0.00"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      )}



      <div>
        <LabelWithTooltip label="BOS Confirmed" term="BOS" />
        <div className="flex gap-4 mt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="m15_bos"
              checked={data.m15_bos === false}
              onChange={() => onChange('m15_bos', false)}
              className="w-4 h-4"
            />
            <span className="text-gray-300">No</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="m15_bos"
              checked={data.m15_bos === true}
              onChange={() => onChange('m15_bos', true)}
              className="w-4 h-4"
            />
            <span className="text-gray-300">Yes</span>
          </label>
        </div>
      </div>

      <div>
        <LabelWithTooltip label="Golden Ratio (0.618-0.786) Reached" term="Golden Ratio" />
        <div className="flex gap-4 mt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="m15_golden_ratio"
              checked={data.m15_golden_ratio === false}
              onChange={() => onChange('m15_golden_ratio', false)}
              className="w-4 h-4"
            />
            <span className="text-gray-300">No</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="m15_golden_ratio"
              checked={data.m15_golden_ratio === true}
              onChange={() => onChange('m15_golden_ratio', true)}
              className="w-4 h-4"
            />
            <span className="text-gray-300">Yes</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <LabelWithTooltip label="POI Type" term="POI" />
          <select
            value={data.m15_poi_type || ''}
            onChange={(e) => onChange('m15_poi_type', e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Select POI type</option>
            <option value="Order Block">Order Block</option>
            <option value="FVG">FVG</option>
            <option value="Both">Golden Ratio</option>
          </select>
        </div>

        
      </div>

      

      <div>
        <LabelWithTooltip label="Notes" />
        <textarea
          value={data.m15_notes || ''}
          onChange={(e) => onChange('m15_notes', e.target.value)}
          placeholder="Add any relevant analysis notes..."
          rows={4}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
};
