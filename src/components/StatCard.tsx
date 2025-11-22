import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: 'default' | 'success' | 'danger' | 'warning';
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, subtitle, variant = 'default', icon }) => {
  const bgColor = {
    default: 'bg-slate-700 border-slate-600',
    success: 'bg-green-900 border-green-700',
    danger: 'bg-red-900 border-red-700',
    warning: 'bg-yellow-900 border-yellow-700',
  }[variant];

  const textColor = {
    default: 'text-white',
    success: 'text-green-100',
    danger: 'text-red-100',
    warning: 'text-yellow-100',
  }[variant];

  return (
    <div className={`${bgColor} border rounded-lg p-6`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-2">{label}</p>
          <p className={`text-3xl font-bold ${textColor} mb-1`}>{value}</p>
          {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
        </div>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>
    </div>
  );
};
