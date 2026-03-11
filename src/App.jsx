import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import CatchLog from './pages/CatchLog';
import FlyBox from './pages/FlyBox';
import FishingMap from './pages/FishingMap';
import Dashboard from './pages/Dashboard';

export default function App() {
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
