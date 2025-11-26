import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth, ThemeProvider, useTheme } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { Navigation } from './components/Navigation';
import { ToastContainer } from './components/Toast';
import FloatingChatButton from './components/FloatingChatButton';
import { TradeEntryForm } from './components/TradeEntryForm';
import { AuthPage } from './pages/AuthPage';
import { Trade } from './types';
import { Menu } from 'lucide-react';
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
const CalculatorPage = lazy(() => import('./pages/CalculatorPage'));
const EconomicCalendarPage = lazy(() => import('./pages/EconomicCalendarPage'));
const AICoachPage = lazy(() => import('./pages/AICoachPage'));
const SocialHubPage = lazy(() => import('./pages/SocialHubPage'));
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage'));
const ExchangeSyncPage = lazy(() => import('./pages/ExchangeSyncPage'));

const AppContent: React.FC = () => {

  const { session, loading, userProfile } = useAuth();
  const { isDarkMode, setThemeFromProfile } = useTheme();
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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



  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    navigate('/trade-entry');
  };

  const handleCloseTradeForm = () => {
    setEditingTrade(null);
    navigate('/all-trades');
  };

  const handleNewTrade = () => {
    setEditingTrade(null);
    navigate('/trade-entry');
  };

return (

  <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>

    {/* Mobile Menu Button */}
    <div className="md:hidden fixed top-4 left-4 z-50">
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="p-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>
    </div>

    <Navigation mobileMenuOpen={mobileMenuOpen} onCloseMobileMenu={() => setMobileMenuOpen(false)} />

    <main className="ml-0 md:ml-64 max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pt-16 md:pt-8">

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

        <Routes>

          <Route path="/" element={<DashboardPage />} />

          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/crypto-prices" element={<CryptoPricesPage />} />

          <Route path="/portfolio" element={<PortfolioPage />} />

          <Route path="/crypto-news" element={<CryptoNewsPage />} />

          <Route path="/price-alerts" element={<PriceAlertsPage />} />

          <Route path="/market-insights" element={<MarketInsightsPage />} />

          <Route path="/trade-entry" element={

            editingTrade ? (

              <TradeEntryForm

                editingTrade={editingTrade}

                onClose={handleCloseTradeForm}

              />

            ) : (

              <TradeEntryForm onClose={() => navigate('/dashboard')} />

            )

          } />

          <Route path="/all-trades" element={

            <AllTradesPage onEditTrade={handleEditTrade} />

          } />

          <Route path="/analytics" element={<AnalyticsPage />} />

          <Route path="/weekly-review" element={<WeeklyReviewPage />} />

          <Route path="/trading-plan" element={<TradingPlanPage />} />

          <Route path="/journal" element={<JournalPage />} />

          <Route path="/goals" element={<GoalsPage />} />

          <Route path="/posts" element={<PostsPage />} />

          <Route path="/settings" element={<SettingsPage />} />

          <Route path="/calculator" element={<CalculatorPage />} />

          <Route path="/calendar" element={<EconomicCalendarPage />} />

          <Route path="/ai-coach" element={<AICoachPage />} />

          <Route path="/social-hub" element={<SocialHubPage />} />

          <Route path="/profile" element={<PublicProfilePage />} />

          <Route path="/exchange-sync" element={<ExchangeSyncPage />} />

        </Routes>

      </Suspense>

    </main>

    <ToastContainer />

    <FloatingChatButton />

  </div>

);

};



function App() {

  return (

    <BrowserRouter>

      <ThemeProvider>

        <AuthProvider>

          <ToastProvider>

            <AppContent />

          </ToastProvider>

        </AuthProvider>

      </ThemeProvider>

    </BrowserRouter>

  );

}



export default App;

