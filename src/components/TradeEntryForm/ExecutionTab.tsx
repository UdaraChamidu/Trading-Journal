import React, { useEffect } from 'react';
import { LabelWithTooltip } from '../Tooltip';
import { calculateRiskDollar, calculatePositionSize, calculateRiskRewardRatio } from '../../lib/calculations';

interface ExecutionTabProps {
  data: any;
  onChange: (field: string, value: any) => void;
  accountBalance: number;
}

export const ExecutionTab: React.FC<ExecutionTabProps> = ({ data, onChange, accountBalance }) => {
  useEffect(() => {
    if (data.risk_percent && accountBalance) {
      const riskDollar = calculateRiskDollar(accountBalance, data.risk_percent);
      onChange('risk_dollar', riskDollar);

      if (data.entry_price && data.stop_loss) {
        const posSize = calculatePositionSize(riskDollar, data.entry_price, data.stop_loss);
        onChange('position_size', parseFloat(posSize.toFixed(4)));
      }
    }
  }, [data.risk_percent, accountBalance, data.entry_price, data.stop_loss]);

  useEffect(() => {
    if (data.entry_price && data.take_profit && data.stop_loss) {
      const rr = calculateRiskRewardRatio(data.entry_price, data.take_profit, data.stop_loss);
      if (rr) onChange('risk_reward_ratio', rr);
    }
  }, [data.entry_price, data.take_profit, data.stop_loss]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <LabelWithTooltip label="Direction" required />
          <div className="flex gap-4">
            {['Long', 'Short'].map((dir) => (
              <button
                key={dir}
                onClick={() => onChange('direction', dir)}
                className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                  data.direction === dir
                    ? dir === 'Long'
                      ? 'bg-green-600 border-green-500 text-white'
                      : 'bg-red-600 border-red-500 text-white'
                    : 'bg-slate-700 border-slate-600 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {dir}
              </button>
            ))}
          </div>
        </div>

        <div>
            <LabelWithTooltip label="Risk Percent" required />
             <select
                value={data.risk_percent || ''}
                onChange={(e) => onChange('risk_percent', parseFloat(e.target.value))}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
                <option value="">Select Risk %</option>
                <option value="0.5">0.5%</option>
                <option value="1.0">1.0%</option>
                <option value="1.5">1.5%</option>
                <option value="2.0">2.0%</option>
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <LabelWithTooltip label="Entry Price" required />
          <input
            type="number"
            step="0.00001"
            value={data.entry_price || ''}
            onChange={(e) => onChange('entry_price', parseFloat(e.target.value))}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <LabelWithTooltip label="Stop Loss" required />
          <input
            type="number"
            step="0.00001"
            value={data.stop_loss || ''}
            onChange={(e) => onChange('stop_loss', parseFloat(e.target.value))}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <LabelWithTooltip label="Take Profit" />
          <input
            type="number"
            step="0.00001"
            value={data.take_profit || ''}
            onChange={(e) => onChange('take_profit', parseFloat(e.target.value))}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-800 p-4 rounded-lg border border-slate-700">
         <div>
          <LabelWithTooltip label="Risk Amount ($)" />
          <input
            type="number"
            value={data.risk_dollar || ''}
            disabled
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-gray-400 cursor-not-allowed"
          />
        </div>
         <div>
          <LabelWithTooltip label="Position Size" />
          <input
            type="number"
            value={data.position_size || ''}
            disabled
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-gray-400 cursor-not-allowed"
          />
        </div>
         <div>
          <LabelWithTooltip label="Risk:Reward" />
          <input
            type="number"
            value={data.risk_reward_ratio || ''}
            disabled
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-gray-400 cursor-not-allowed"
          />
        </div>
      </div>

      <hr className="border-slate-600 my-4" />

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <LabelWithTooltip label="Exit Price" />
          <input
            type="number"
             step="0.00001"
            value={data.exit_price || ''}
            onChange={(e) => onChange('exit_price', parseFloat(e.target.value))}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <LabelWithTooltip label="Exit Reason" />
           <select
            value={data.exit_reason || ''}
            onChange={(e) => onChange('exit_reason', e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Select reason</option>
            <option value="Take Profit">Take Profit</option>
            <option value="Stop Loss">Stop Loss</option>
            <option value="Manual Close">Manual Close</option>
            <option value="Break Even">Break Even</option>
          </select>
        </div>
      </div>
    </div>
  );
};
