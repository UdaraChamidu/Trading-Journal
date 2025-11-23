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
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CryptoPricesPage = lazy(() => import('./pages/CryptoPricesPage'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const CryptoNewsPage = lazy(() => import('./pages/CryptoNewsPage'));
const PriceAlertsPage = lazy(() => import('./pages/PriceAlertsPage'));
const MarketInsightsPage = lazy(() => import('./pages/MarketInsightsPage'));
const AllTradesPage = lazy(() => import('./pages/AllTradesPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const WeeklyReviewPage = lazy(() => import('./pages/WeeklyReviewPage'));
const TradingPlanPage = lazy(() => import('./pages/TradingPlanPage'));
const JournalPage = lazy(() => import('./pages/JournalPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const PostsPage = lazy(() => import('./pages/PostsPage'));

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
      case 'crypto-prices':
        return <CryptoPricesPage />;
      case 'portfolio':
        return <PortfolioPage />;
      case 'crypto-news':
        return <CryptoNewsPage />;
      case 'price-alerts':
        return <PriceAlertsPage />;
      case 'market-insights':
        return <MarketInsightsPage />;
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

      <main className="ml-64 max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={
          <div className={`flex items-center justify-center min-h-screen ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <div>Loading...</div>
            </div>
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
