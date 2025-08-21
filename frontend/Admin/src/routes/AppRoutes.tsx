import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
import HomepagePage from '../pages/homepage/HomepagePage';
import AIPage from '../pages/ai/AIPage';
import UsersPage from '../pages/users/UsersPage';
import SettingsPage from '../pages/settings/SettingsPage';

const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
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
        <Route path="/homepage" element={<HomepagePage />} />
        <Route path="/ai" element={<AIPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Layout>
  );
};

export default AppRoutes;