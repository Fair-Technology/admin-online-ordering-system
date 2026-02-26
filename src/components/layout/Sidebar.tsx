import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/shops', label: 'Shops' },
];

export function Sidebar() {
  return (
    <aside className="w-56 flex-shrink-0 bg-gray-900 text-white flex flex-col">
      <div className="h-14 flex items-center px-4 border-b border-gray-700">
        <span className="font-semibold text-sm tracking-wide">Admin Panel</span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
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
