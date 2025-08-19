import React, { useEffect } from 'react';
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
import { useStore } from './store/useStore';

function App() {
  const { darkMode, fetchNotifications } = useStore();

  useEffect(() => {
    // Initialize notifications
    fetchNotifications();
    
    // Apply dark mode class
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode, fetchNotifications]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          
          <div className="flex flex-1">
            <Sidebar />
            
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/house/:id" element={<HouseDetailPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/insights" element={<InsightsPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/safety" element={<SafetyPage />} />
                
                {/* Placeholder routes for future features */}
                <Route path="/settings" element={
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground mt-2">Settings page coming soon...</p>
                  </div>
                } />
                <Route path="/help" element={
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold">Help & Support</h1>
                    <p className="text-muted-foreground mt-2">Help documentation coming soon...</p>
                  </div>
                } />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </div>
  );
}

export default App;