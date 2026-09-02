import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SideNav from './SideNav';
import TopNav from './TopNav';

export type LayoutContextType = {
  setHideTopNav: (hide: boolean) => void;
  searchQuery: string;
  setHideSearch: (hide: boolean) => void;
  setFullScreenMode: (fullScreen: boolean) => void;
};

const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hideSearch, setHideSearch] = useState(false);
  const [hideTopNav, setHideTopNav] = useState(false);
  const [fullScreenMode, setFullScreenMode] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 flex font-sans overflow-hidden">
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <SideNav 
        isMobileMenuOpen={isMobileMenuOpen} 
        closeMobileMenu={() => setIsMobileMenuOpen(false)} 
      />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {!hideTopNav && (
          <TopNav 
            setIsMobileMenuOpen={setIsMobileMenuOpen} 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            hideSearch={hideSearch}
          />
        )}
        
        <div className={`flex-1 overflow-auto flex flex-col ${fullScreenMode ? '' : 'p-4 md:p-8'}`}>
          <div className={`flex-1 flex flex-col ${fullScreenMode ? 'w-full h-full' : 'max-w-6xl mx-auto w-full'}`}>
            <Outlet context={{ setHideTopNav, searchQuery, setHideSearch, setFullScreenMode }} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
