import React, { useState, Suspense, lazy } from 'react';
import { AuthProvider, useAuth, ThemeProvider, useTheme } from './contexts/AuthContext';
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
const PostsPage = lazy(() => import('./pages/PostsPage').then(module => ({ default: module.PostsPage })));

const AppContent: React.FC = () => {
  const { session, loading, userProfile } = useAuth();
  const { isDarkMode, setThemeFromProfile } = useTheme();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  // Sync theme with user profile
  React.useEffect(() => {
    if (userProfile?.dark_mode !== undefined) {
      setThemeFromProfile(userProfile.dark_mode);
    }
  }, [userProfile, setThemeFromProfile]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-slate-900' : 'bg-gray-100'
      }`}>
        <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading...</div>
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
      case 'posts':
        return <PostsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <Navigation currentPage={currentPage} onPageChange={(page) => {
        setCurrentPage(page);
        setEditingTrade(null);
      }} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={
          <div className={`flex items-center justify-center min-h-screen ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Loading...
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
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
