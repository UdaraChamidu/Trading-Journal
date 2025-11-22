import React, { useState } from 'react';
import { LabelWithTooltip } from '../Tooltip';

interface PsychologyTabProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

export const PsychologyTab: React.FC<PsychologyTabProps> = ({ data, onChange }) => {
  const [showScreenshot, setShowScreenshot] = useState(false);

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Screenshot must be under 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        onChange('screenshot_url', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <LabelWithTooltip label="Pre-Trade Emotions" />
          <select
            value={data.pre_emotion || ''}
            onChange={(e) => onChange('pre_emotion', e.target.value || null)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Select emotion</option>
            <option value="Calm">Calm</option>
            <option value="Anxious">Anxious</option>
            <option value="Confident">Confident</option>
            <option value="Rushing">Rushing</option>
            <option value="FOMO">FOMO</option>
          </select>
        </div>

        <div>
          <LabelWithTooltip label="During-Trade Emotions" />
          <select
            value={data.during_emotion || ''}
            onChange={(e) => onChange('during_emotion', e.target.value || null)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Select emotion</option>
            <option value="Patient">Patient</option>
            <option value="Nervous">Nervous</option>
            <option value="Confident">Confident</option>
            <option value="Stressed">Stressed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <LabelWithTooltip label="Post-Trade Feeling" />
          <select
            value={data.post_feeling || ''}
            onChange={(e) => onChange('post_feeling', e.target.value || null)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Select feeling</option>
            <option value="Satisfied">Satisfied</option>
            <option value="Frustrated">Frustrated</option>
            <option value="Neutral">Neutral</option>
            <option value="Excited">Excited</option>
          </select>
        </div>

        <div>
          <LabelWithTooltip label="Plan Followed" term="Plan Adherence" />
          <select
            value={data.plan_followed || ''}
            onChange={(e) => onChange('plan_followed', e.target.value || null)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Select percentage</option>
            <option value="100%">100%</option>
            <option value="90%">90%</option>
            <option value="75%">75%</option>
            <option value="50%">50%</option>
            <option value="<50%">&lt;50%</option>
          </select>
        </div>
      </div>

      <div>
        <LabelWithTooltip label="Mistakes Made" />
        <textarea
          value={data.mistakes_made || ''}
          onChange={(e) => onChange('mistakes_made', e.target.value)}
          placeholder="What mistakes did you make in this trade..."
          rows={3}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <LabelWithTooltip label="Lesson Learned" />
        <textarea
          value={data.lesson_learned || ''}
          onChange={(e) => onChange('lesson_learned', e.target.value)}
          placeholder="What did you learn from this trade..."
          rows={3}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <LabelWithTooltip label="Screenshot" />
        <button
          type="button"
          onClick={() => setShowScreenshot(!showScreenshot)}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white transition-colors"
        >
          {data.screenshot_url ? '✓ Screenshot Added' : 'Upload Screenshot'}
        </button>

        {showScreenshot && (
          <input
            type="file"
            accept="image/*"
            onChange={handleScreenshotUpload}
            className="mt-2 w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          />
        )}

        {data.screenshot_url && (
          <div className="mt-2">
            <img src={data.screenshot_url} alt="Trade screenshot" className="max-w-xs rounded-lg" />
          </div>
        )}
      </div>
    </div>
  );
};
