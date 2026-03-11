import { NavLink, Outlet } from 'react-router-dom';
import { Fish, Bug, Map, BarChart3 } from 'lucide-react';

const tabs = [
  { to: '/', icon: Fish, label: 'Catches' },
  { to: '/flybox', icon: Bug, label: 'Fly Box' },
  { to: '/map', icon: Map, label: 'Spots' },
  { to: '/dashboard', icon: BarChart3, label: 'Stats' },
];

export default function Layout() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#1c1917]">
      <header className="header-lodge text-amber-100 px-4 py-3.5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-700/30 flex items-center justify-center border border-amber-600/40">
          <Fish className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-amber-50" style={{ fontFamily: 'Bitter, Georgia, serif' }}>TightLines</h1>
          <p className="text-[10px] text-amber-600 tracking-[0.2em] uppercase -mt-0.5">Fly Fishing Journal</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <nav className="nav-lodge fixed bottom-0 left-0 right-0 z-50">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {tabs.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? 'text-amber-400'
                    : 'text-stone-500 hover:text-stone-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-lg ${isActive ? 'bg-amber-400/10' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] tracking-wide uppercase ${isActive ? 'font-semibold' : ''}`}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
