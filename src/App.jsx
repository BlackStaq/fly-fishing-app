import { useState, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import CatchLog from './pages/CatchLog';
import FlyBox from './pages/FlyBox';
import FishingMap from './pages/FishingMap';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('tightlines_user'));

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  const handleLogin = useCallback(() => {
    setIsLoggedIn(true);
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (!isLoggedIn) {
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
