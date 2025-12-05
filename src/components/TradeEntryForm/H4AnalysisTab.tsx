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
            <option value="Liquidity Pool">Golden Ratio</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
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
