import React, { useEffect } from 'react';
import { LabelWithTooltip } from '../Tooltip';
import { calculateRiskDollar, calculatePositionSize, calculateRiskRewardRatio } from '../../lib/calculations';

interface ExecutionTabProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

export const ExecutionTab: React.FC<ExecutionTabProps> = ({ data, onChange }) => {
  useEffect(() => {
    if (data.risk_percent && data.account_balance) {
      const riskDollar = calculateRiskDollar(data.account_balance, data.risk_percent);
      onChange('risk_dollar', parseFloat(riskDollar.toFixed(2)));
    }
  }, [data.risk_percent, data.account_balance]);

  useEffect(() => {
    if (data.entry_price && data.stop_loss && data.risk_dollar) {
      const positionSize = calculatePositionSize(data.risk_dollar, data.entry_price, data.stop_loss);
      onChange('position_size', parseFloat(positionSize.toFixed(8)));
    }
  }, [data.entry_price, data.stop_loss, data.risk_dollar]);

  useEffect(() => {
    if (data.entry_price && data.take_profit && data.stop_loss) {
      const rr = calculateRiskRewardRatio(data.entry_price, data.take_profit, data.stop_loss);
      onChange('risk_reward_ratio', rr);
    }
  }, [data.entry_price, data.take_profit, data.stop_loss]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <LabelWithTooltip label="Direction" required />
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="direction"
                checked={data.direction === 'Long'}
                onChange={() => onChange('direction', 'Long')}
                className="w-4 h-4"
              />
              <span className="text-gray-300">Long</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="direction"
                checked={data.direction === 'Short'}
                onChange={() => onChange('direction', 'Short')}
                className="w-4 h-4"
              />
              <span className="text-gray-300">Short</span>
            </label>
          </div>
        </div>

        <div>
          <LabelWithTooltip label="Risk %" required term="Risk %" />
          <select
            value={data.risk_percent || ''}
            onChange={(e) => onChange('risk_percent', e.target.value ? parseFloat(e.target.value) : null)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Select risk %</option>
            <option value="1">1%</option>
            <option value="1.5">1.5%</option>
            <option value="2">2%</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <LabelWithTooltip label="Entry Price" required />
          <input
            type="number"
            step="0.01"
            value={data.entry_price || ''}
            onChange={(e) => onChange('entry_price', e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="0.00"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <LabelWithTooltip label="Stop Loss" required />
          <input
            type="number"
            step="0.01"
            value={data.stop_loss || ''}
            onChange={(e) => onChange('stop_loss', e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="0.00"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <LabelWithTooltip label="Take Profit" />
          <input
            type="number"
            step="0.01"
            value={data.take_profit || ''}
            onChange={(e) => onChange('take_profit', e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="0.00"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <LabelWithTooltip label="Exit Price" />
          <input
            type="number"
            step="0.01"
            value={data.exit_price || ''}
            onChange={(e) => onChange('exit_price', e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="0.00"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-slate-700 border border-slate-600 rounded-lg p-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-300">Risk $:</span>
          <span className="text-white font-semibold">${data.risk_dollar?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Position Size:</span>
          <span className="text-white font-semibold">{data.position_size?.toFixed(8) || '0'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Risk:Reward:</span>
          <span className="text-white font-semibold">{data.risk_reward_ratio ? `1:${data.risk_reward_ratio}` : '-'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <LabelWithTooltip label="Break Even Applied" term="Break Even" />
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="break_even_applied"
                checked={data.break_even_applied === false}
                onChange={() => onChange('break_even_applied', false)}
                className="w-4 h-4"
              />
              <span className="text-gray-300">No</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="break_even_applied"
                checked={data.break_even_applied === true}
                onChange={() => onChange('break_even_applied', true)}
                className="w-4 h-4"
              />
              <span className="text-gray-300">Yes (1:5)</span>
            </label>
          </div>
        </div>

        <div>
          <LabelWithTooltip label="Exit Reason" />
          <select
            value={data.exit_reason || ''}
            onChange={(e) => onChange('exit_reason', e.target.value || null)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Select reason</option>
            <option value="Hit TP">Hit TP</option>
            <option value="Hit SL">Hit SL</option>
            <option value="Manual Exit">Manual Exit</option>
            <option value="BE Stop">BE Stop</option>
            <option value="15min Reversal">15min Reversal</option>
          </select>
        </div>
      </div>
    </div>
  );
};
