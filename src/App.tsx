import React, { useState, Suspense, lazy } from 'react';
import { AuthProvider, useAuth, ThemeProvider, useTheme } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { Navigation } from './components/Navigation';
// import { ToastContainer } from './components/Toast'; // Mocking below to avoid file errors
// import { TradeEntryForm } from './components/TradeEntryForm'; // Mocking below
import { Trade } from './types';
import './index.css';

// Mock components to make the preview runnable without all files
const ToastContainer = () => <div />;
const TradeEntryForm = ({ onClose }: any) => <div className="p-4 text-white">Trade Form <button onClick={onClose} className="bg-blue-500 p-2 rounded">Close</button></div>;
const AuthPage = () => <div className="p-10 text-center text-white">Please Login</div>;

// Dummy Pages for Preview
const DummyPage = ({ title }: { title: string }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-white mb-4">{title}</h1>
    <p className="text-gray-400">Content for {title} goes here.</p>
  </div>
);

// Lazy load page components - Using Dummies for preview stability
// In your real app, uncomment the real imports
/* const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CryptoPricesPage = lazy(() => import('./pages/CryptoPricesPage'));
...
*/

// Mocking lazy loads
const DashboardPage = () => <DummyPage title="Dashboard" />;
const CryptoPricesPage = () => <DummyPage title="Crypto Prices" />;
const PortfolioPage = () => <DummyPage title="Portfolio" />;
const CryptoNewsPage = () => <DummyPage title="Crypto News" />;
const PriceAlertsPage = () => <DummyPage title="Price Alerts" />;
const MarketInsightsPage = () => <DummyPage title="Market Insights" />;
const AllTradesPage = ({ onEditTrade }: any) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-white mb-4">All Trades</h1>
    <button onClick={() => onEditTrade({ id: '1', symbol: 'BTC' })} className="bg-blue-600 text-white p-2 rounded">Edit Dummy Trade</button>
  </div>
);
const AnalyticsPage = () => <DummyPage title="Analytics" />;
const WeeklyReviewPage = () => <DummyPage title="Weekly Review" />;
const TradingPlanPage = () => <DummyPage title="Trading Plan" />;
const JournalPage = () => <DummyPage title="Journal" />;
const GoalsPage = () => <DummyPage title="Goals" />;
const SettingsPage = () => <DummyPage title="Settings" />;
const PostsPage = () => <DummyPage title="Posts" />;

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
            onEditTrade={(trade: Trade) => {
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

      {/* Main content area adjusted with ml-64 to account for fixed sidebar */}
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
