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
    <div className="flex flex-col min-h-[100dvh]">
      <header className="bg-[#1a6b4a] text-white px-4 py-3 flex items-center gap-3 shadow-md">
        <Fish className="w-7 h-7" />
        <h1 className="text-xl font-bold tracking-tight">TightLines</h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {tabs.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                  isActive
                    ? 'text-[#1a6b4a] font-semibold'
                    : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
