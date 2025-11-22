import React, { useState, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthPage } from './pages/AuthPage';
import { Navigation } from './components/Navigation';
import { ToastContainer } from './components/Toast';
import { TradeEntryForm } from './components/TradeEntryForm';
import { Trade } from './types';
import './index.css';

// Lazy load page components
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const AllTradesPage = lazy(() => import('./pages/AllTradesPage').then(module => ({ default: module.AllTradesPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(module => ({ default: module.AnalyticsPage })));
const WeeklyReviewPage = lazy(() => import('./pages/WeeklyReviewPage').then(module => ({ default: module.WeeklyReviewPage })));
const TradingPlanPage = lazy(() => import('./pages/TradingPlanPage').then(module => ({ default: module.TradingPlanPage })));
const JournalPage = lazy(() => import('./pages/JournalPage').then(module => ({ default: module.JournalPage })));
const GoalsPage = lazy(() => import('./pages/GoalsPage').then(module => ({ default: module.GoalsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })));

const AppContent: React.FC = () => {
  const { session, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'trade-entry':
        return editingTrade ? (
          <TradeEntryForm
            editingTrade={editingTrade}
            onClose={() => {
              setEditingTrade(null);
              setCurrentPage('all-trades');
            }}
          />
        ) : (
          <TradeEntryForm onClose={() => setCurrentPage('dashboard')} />
        );
      case 'all-trades':
        return (
          <AllTradesPage
            onEditTrade={(trade) => {
              setEditingTrade(trade);
              setCurrentPage('trade-entry');
            }}
          />
        );
      case 'analytics':
        return <AnalyticsPage />;
      case 'weekly-review':
        return <WeeklyReviewPage />;
      case 'trading-plan':
        return <TradingPlanPage />;
      case 'journal':
        return <JournalPage />;
      case 'goals':
        return <GoalsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation currentPage={currentPage} onPageChange={(page) => {
        setCurrentPage(page);
        setEditingTrade(null);
      }} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-gray-400">Loading...</div>
          </div>
        }>
          {renderPage()}
        </Suspense>
      </main>

      <ToastContainer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
