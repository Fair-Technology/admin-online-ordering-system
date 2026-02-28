import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/shops', label: 'Shops' },
];

export function Sidebar() {
  return (
    <aside className="relative z-10 w-56 flex-shrink-0 backdrop-blur-xl bg-white/8 border-r border-white/15 text-white flex flex-col">
      <div className="h-14 flex items-center px-4 border-b border-white/10">
        <span className="font-semibold text-sm tracking-wide text-white">Admin Panel</span>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
