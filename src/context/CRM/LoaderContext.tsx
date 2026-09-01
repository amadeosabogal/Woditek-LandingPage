import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface LoaderContextType {
  showLoader: (message: string) => void;
  hideLoader: () => void;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }
  return context;
};

export const LoaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');

  const showLoader = (msg: string) => {
    setMessage(msg);
    setIsVisible(true);
  };

  const hideLoader = () => {
    setIsVisible(false);
    // Slight delay to allow fade out animation to finish before clearing message
    setTimeout(() => setMessage(''), 300);
  };

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader }}>
      {children}

      {isVisible && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-auto p-4">
          <div className="bg-surface border border-border-subtle rounded-lg shadow-2xl px-8 py-6 flex flex-col items-center justify-center max-w-sm text-center">
            <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-on-surface font-body-md font-medium">
              {message}
            </p>
          </div>
        </div>
      )}
    </LoaderContext.Provider>
  );
};
