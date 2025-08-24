import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import Layout from '../components/layout/Layout';
import LoginPage from '../pages/auth/LoginPage';
import Dashboard from '../pages/Dashboard';
import ListingsPage from '../pages/listings/ListingsPage';
import AddHousePage from '../pages/listings/AddHousePage';
import LandlordsPage from '../pages/landlords/LandlordsPage';
import SafetyPage from '../pages/safety/SafetyPage';
import AnalyticsPage from '../pages/analytics/AnalyticsPage';
import ReviewsPage from '../pages/reviews/ReviewsPage';
import MediaPage from '../pages/media/MediaPage';
import ZonesPage from '../pages/zones/ZonesPage';
// ...removed HomepagePage and AIPage imports...
import UsersPage from '../pages/users/UsersPage';
import SettingsPage from '../pages/settings/SettingsPage';
import LoadingScreen from '../components/ui/LoadingScreen';

const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [showLogo, setShowLogo] = useState(true);

  useEffect(() => {
    // Fade out the logo after 2 seconds
    const timer = setTimeout(() => {
      setShowLogo(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading || showLogo) {
    return <LoadingScreen message={isLoading ? "Loading data..." : "Welcome to Comrade Kejani"} />;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
  <Route path="/listings" element={<ListingsPage />} />
  <Route path="/listings/add" element={<AddHousePage />} />
        <Route path="/landlords" element={<LandlordsPage />} />
        <Route path="/safety" element={<SafetyPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/media" element={<MediaPage />} />
        <Route path="/zones" element={<ZonesPage />} />
  {/* Removed Homepage and AI Center routes */}
        <Route path="/users" element={<UsersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Layout>
  );
};

export default AppRoutes;