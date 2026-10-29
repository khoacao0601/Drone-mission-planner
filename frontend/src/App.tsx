// Copyright (c) 2026 Khoa Cao. All rights reserved.

import { useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { authAPI } from './services/api';
import { LoginPage } from './components/loginPage';
import { Header } from './components/header';
import { Sidebar } from './components/sidebar';
import { MapViewer } from './components/mapViewer';

function App() {
  const { user, isInitializing, login, setInitializing } = useAuthStore();

  // Restore session from HttpOnly cookie on first load or F5
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const data = await authAPI.refresh();
        login(data.access_token, data.user);
      } catch {
        // No valid session cookie found -> finish initializing to show Login page
        setInitializing(false);
      }
    };

    restoreSession();
  }, [login, setInitializing]);

  // 1. Loading Screen during initial session check
  if (isInitializing) {
    return (
      <div className="w-screen h-screen bg-slate-950 flex flex-col justify-center items-center text-white select-none">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
        <h2 className="text-sm font-semibold tracking-wider uppercase text-gray-300">Flyby Mission Control</h2>
        <p className="text-xs text-gray-500 mt-1">Initializing tactical session...</p>
      </div>
    );
  }

  // 2. Unauthenticated: Show dedicated Login Page
  if (!user) {
    return <LoginPage />;
  }

  // 3. Authenticated: Render 3D Flight Planner Dashboard
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      <Header />
      <Sidebar />
      <MapViewer />
    </div>
  );
}

export default App;