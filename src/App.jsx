import { useState, useCallback, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { supabase } from './supabase';
import Layout from './components/Layout';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import CatchLog from './pages/CatchLog';
import FlyBox from './pages/FlyBox';
import FishingMap from './pages/FishingMap';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  const handleLogin = useCallback(() => {
    // Session will be set by onAuthStateChange listener
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (authLoading) return null;

  if (!session) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<CatchLog />} />
        <Route path="/flybox" element={<FlyBox />} />
        <Route path="/map" element={<FishingMap />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
