import React from 'react';
import { LabelWithTooltip } from '../Tooltip';

interface H4AnalysisTabProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

export const H4AnalysisTab: React.FC<H4AnalysisTabProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <LabelWithTooltip label="Trend" term="4H Analysis" />
          <select
            value={data.h4_trend || ''}
            onChange={(e) => onChange('h4_trend', e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Select trend</option>
            <option value="Bullish">Bullish</option>
            <option value="Bearish">Bearish</option>
            <option value="Ranging">Ranging</option>
          </select>
        </div>

        <div>
          <LabelWithTooltip label="POI Type" term="POI" />
          <select
            value={data.h4_poi_type || ''}
            onChange={(e) => onChange('h4_poi_type', e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Select POI type</option>
            <option value="Order Block">Order Block</option>
            <option value="FVG">FVG</option>
            <option value="Liquidity Pool">Liquidity Pool</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <LabelWithTooltip label="POI Price Level" />
          <input
            type="number"
            step="0.01"
            value={data.h4_poi_price || ''}
            onChange={(e) => onChange('h4_poi_price', e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="0.00"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <LabelWithTooltip label="Target Price Level" />
          <input
            type="number"
            step="0.01"
            value={data.h4_target_price || ''}
            onChange={(e) => onChange('h4_target_price', e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="0.00"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <LabelWithTooltip label="Notes" />
        <textarea
          value={data.h4_notes || ''}
          onChange={(e) => onChange('h4_notes', e.target.value)}
          placeholder="Add any relevant analysis notes..."
          rows={4}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
};
