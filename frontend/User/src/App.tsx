import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { HomePage } from './pages/HomePage';
import { HouseDetailPage } from './pages/HouseDetailPage';
import { MapPage } from './pages/MapPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { InsightsPage } from './pages/InsightsPage';
import { CommunityPage } from './pages/CommunityPage';
import { SafetyPage } from './pages/SafetyPage';
import { AboutPage } from './pages/AboutPage';
import { ComparePage } from './pages/ComparePage';
import FilterPage from './pages/FilterPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import LicensingPage from './pages/LicensingPage';
import { useStore } from './store/useStore';
import { useTheme } from './contexts/useTheme';

function App() {
  const { fetchNotifications } = useStore();
  const { theme } = useTheme();

  useEffect(() => {
    // Initialize notifications
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-oxford-900 text-foreground' : 'bg-white text-gray-900'}`}>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          
          <div className="flex flex-1">
            <Sidebar />
            
            <main className={`flex-1 overflow-auto ${theme === 'light' ? 'bg-white' : ''}`}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/house/:id" element={<HouseDetailPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/insights" element={<InsightsPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/safety" element={<SafetyPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/licensing" element={<LicensingPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/filter" element={<FilterPage />} />
                
                {/* Help now reuses Safety page content; Settings removed until implemented */}
                <Route path="/help" element={<SafetyPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </div>
  );
}

export default App;