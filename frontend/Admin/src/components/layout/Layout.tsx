import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-oxford-900">
      <Header />
      <div className="flex flex-row w-full">
        <Sidebar />
        <main className="flex-1 relative overflow-y-auto focus:outline-none ml-8">{/* Added left margin for space from sidebar */}
          <div className="py-6">
            <div className="px-2">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;