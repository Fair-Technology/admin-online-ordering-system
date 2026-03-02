import { NavLink } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react';

export function Sidebar() {
  const { t, i18n } = useTranslation();
  const { instance, accounts } = useMsal();
  const user = accounts[0];

  const navItems = [
    { to: '/', label: t('nav.dashboard'), end: true },
    { to: '/shops', label: t('nav.shops') },
  ];

  return (
    <aside className="relative z-10 w-56 flex-shrink-0 backdrop-blur-xl bg-white/8 border-r border-white/15 text-white flex flex-col">
      {/* Logo / brand */}
      <div className="h-14 flex items-center px-4 border-b border-white/10">
        <span className="font-semibold text-sm tracking-wide text-white">{t('nav.adminPanel')}</span>
      </div>

      {/* Nav links */}
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

      {/* Language switcher */}
      <div className="px-3 py-2 border-t border-white/10">
        <div className="flex gap-1">
          {(['en', 'de'] as const).map((lng) => (
            <button
              key={lng}
              onClick={() => i18n.changeLanguage(lng)}
              className={`px-2 py-0.5 rounded text-xs font-medium uppercase transition-colors ${
                i18n.resolvedLanguage === lng
                  ? 'bg-white/20 text-white'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {lng}
            </button>
          ))}
        </div>
      </div>

      {/* User footer */}
      <div className="px-3 pb-4 border-t border-white/10 pt-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-white">
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </span>
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name ?? user?.username}</p>
          </div>

          {/* Sign out button */}
          <button
            onClick={() => instance.logoutRedirect()}
            title={t('nav.signOut')}
            className="flex-shrink-0 text-white/40 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
