import React, { useEffect } from 'react';
import { LabelWithTooltip } from '../Tooltip';

interface BasicInfoTabProps {
  data: any;
  onChange: (field: string, value: any) => void;
  accountBalance: number;
}

export const BasicInfoTab: React.FC<BasicInfoTabProps> = ({ data, onChange, accountBalance }) => {
  useEffect(() => {
    if (!data.trade_date) {
      const today = new Date().toISOString().split('T')[0];
      onChange('trade_date', today);
    }
    if (!data.trade_time) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      onChange('trade_time', `${hours}:${minutes}`);
    }
  }, []);

  useEffect(() => {
    if (data.trade_date) {
      const dayOfWeek = new Date(data.trade_date).toLocaleDateString('en-US', { weekday: 'long' });
      onChange('day_of_week', dayOfWeek);
    }
  }, [data.trade_date]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <LabelWithTooltip label="Date" required />
          <input
            type="date"
            value={data.trade_date || ''}
            onChange={(e) => onChange('trade_date', e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <LabelWithTooltip label="Time" required />
          <input
            type="time"
            value={data.trade_time || ''}
            onChange={(e) => onChange('trade_time', e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <LabelWithTooltip label="Day of Week" />
          <input
            type="text"
            value={data.day_of_week || ''}
            disabled
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-400 cursor-not-allowed"
          />
        </div>

        <div>
          <LabelWithTooltip label="Trading Session" required />
          <select
            value={data.session || ''}
            onChange={(e) => onChange('session', e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Select session</option>
            <option value="London Close">London Close (8-10 PM)</option>
            <option value="NY Session">NY Session (10 PM-2 AM)</option>
            <option value="Asian Session">Asian Session (4-7 AM LK time)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <LabelWithTooltip label="Account Balance" required />
          <input
            type="number"
            step="0.01"
            value={data.account_balance || accountBalance}
            onChange={(e) => onChange('account_balance', parseFloat(e.target.value))}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <LabelWithTooltip label="News Event" />
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="news_event"
                checked={data.news_event === false}
                onChange={() => onChange('news_event', false)}
                className="w-4 h-4"
              />
              <span className="text-gray-300">No</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="news_event"
                checked={data.news_event === true}
                onChange={() => onChange('news_event', true)}
                className="w-4 h-4"
              />
              <span className="text-gray-300">Yes</span>
            </label>
          </div>
        </div>
      </div>

      {data.news_event && (
        <div>
          <LabelWithTooltip label="News Details" />
          <textarea
            value={data.news_details || ''}
            onChange={(e) => onChange('news_details', e.target.value)}
            placeholder="Describe the news event..."
            rows={3}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      )}
    </div>
  );
};
