import React from 'react';
import { Outlet } from 'react-router-dom';
import SiteHeader from './SiteHeader';

/**
 * Main layout component with consistent header and navigation
 */
const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="py-4 px-6 border-t text-center text-sm text-muted-foreground">
        <div className="container">
          KenshiBrainWatch © {new Date().getFullYear()} - Neuromorphic Network Security
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
