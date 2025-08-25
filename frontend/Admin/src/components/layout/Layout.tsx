import React, { ReactNode, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useIsMobile } from '../../hooks/useMediaQuery';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile); // Default to open on desktop, closed on mobile

  // Adjust sidebar state when switching between mobile and desktop
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      // Always keep sidebar open on desktop
      setSidebarOpen(true);
    }
  }, [isMobile]);

  // Control body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      // Prevent scrolling on the main content when sidebar is open on mobile
      document.body.style.overflow = 'hidden';
    } else {
      // Allow scrolling when sidebar is closed or on desktop
      document.body.style.overflow = 'auto';
    }

    // Clean up
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobile, sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-oxford-900">
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
      <div className="flex flex-row w-full relative gap-0 pt-16"> {/* Added pt-16 for fixed header */}
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} isMobile={isMobile} />
        
        <main 
          className={`flex-1 relative overflow-y-auto focus:outline-none transition-all duration-300 ease-in-out
            ${sidebarOpen && isMobile ? 'opacity-50' : 'opacity-100'}`}
          style={{
            width: '100%',
            marginLeft: !isMobile ? '224px' : (sidebarOpen ? '224px' : '0'), // Always shift content on desktop
            paddingLeft: '0',
            transition: 'margin-left 0.3s ease-in-out',
          }}
        >
          <div className="py-4">
            <div className="px-4">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;