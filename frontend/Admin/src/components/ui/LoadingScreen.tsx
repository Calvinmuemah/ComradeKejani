import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  fullScreen?: boolean;
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  fullScreen = true, 
  message = "Loading..." 
}) => {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Start the fade-in animation after component mounts
    const timer = setTimeout(() => {
      setFadeIn(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`
      ${fullScreen ? 'min-h-screen fixed inset-0 z-50' : 'h-full w-full'} 
      bg-oxford-900 flex flex-col items-center justify-center
      transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}
    `}>
      <div className="mb-8 animate-fade-in">
        <img
          src="/johnny.png"
          alt="Comrade Kejani Logo"
          className="h-24 w-24 object-cover rounded-xl border-2 border-blue-500 shadow-lg mx-auto"
        />
        <h1 className="text-2xl font-bold text-white mt-4 text-center">Comrade Kejani</h1>
        <p className="text-blue-300 text-center">{message}</p>
      </div>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default LoadingScreen;
