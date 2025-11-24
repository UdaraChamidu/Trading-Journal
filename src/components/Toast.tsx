import React, { useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const Toast: React.FC<{ toast: any; onClose: () => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(onClose, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, onClose]);

  const type = toast.type as 'success' | 'error' | 'info';

  const bgColor = {
    success: 'bg-green-900 border-green-700',
    error: 'bg-red-900 border-red-700',
    info: 'bg-blue-900 border-blue-700',
  }[type];

  const textColor = {
    success: 'text-green-100',
    error: 'text-red-100',
    info: 'text-blue-100',
  }[type];

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  }[type];

  return (
    <div className={`${bgColor} border rounded-lg shadow-lg p-4 flex items-center gap-3 animate-in slide-in-from-right-4 duration-200`}>
      <Icon className={`w-5 h-5 flex-shrink-0 ${textColor}`} />
      <p className={`flex-1 ${textColor}`}>{toast.message}</p>
      <button onClick={onClose} className={`flex-shrink-0 ${textColor} hover:opacity-70`}>
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
