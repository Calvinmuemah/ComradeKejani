import React, { ReactNode, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { ChevronLeft } from 'lucide-react';
import { useIsMobile } from '../../hooks/useMediaQuery';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile); // Default to open on desktop, closed on mobile

  // Close sidebar when switching to mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-oxford-900">
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
      <div className="flex flex-row w-full relative">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} isMobile={isMobile} />
        
        {/* Persistent toggle button for desktop */}
        <button 
          onClick={toggleSidebar}
          className={`hidden md:flex items-center justify-center h-8 w-8 bg-oxford-800 hover:bg-oxford-700 text-blue-300 rounded-full absolute top-4 z-40 transition-all duration-300 ease-in-out shadow-md
                     ${sidebarOpen ? 'left-60' : 'left-6'}`}
        >
          <ChevronLeft className={`h-5 w-5 transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180'}`} />
          <span className="sr-only">{sidebarOpen ? 'Close sidebar' : 'Open sidebar'}</span>
        </button>
        
        <main 
          className={`flex-1 relative overflow-y-auto focus:outline-none transition-all duration-300 ease-in-out
                     ${sidebarOpen ? 'md:ml-4 lg:ml-8' : 'ml-0'}`}
          style={{
            width: '100%',
            marginLeft: sidebarOpen && !isMobile ? '16rem' : '0',
            paddingLeft: sidebarOpen && !isMobile ? '0' : '1rem',
          }}
        >
          <div className="py-4 sm:py-6">
            <div className="px-2 sm:px-4">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;