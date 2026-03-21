import { useState, useRef, useEffect } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, LogOut } from 'lucide-react';
import { useGetMyShopsQuery, useGetShopByIdQuery } from '../../services/api';

export function TopNav() {
  const { shopId } = useParams<{ shopId?: string }>();
  const { t, i18n } = useTranslation();
  const { instance, accounts } = useMsal();
  const user = accounts[0];
  const navigate = useNavigate();

  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: myShops } = useGetMyShopsQuery();
  const { data: currentShop } = useGetShopByIdQuery(
    { shopId: shopId! },
    { skip: !shopId },
  );

  const currentUserId = user?.localAccountId;
  const role = shopId && currentShop
    ? (currentShop.members ?? []).find((m) => m.userId === currentUserId && m.isActive)?.role ?? null
    : null;
  const isOwner = role === 'owner';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShopDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navPillClass = (isActive: boolean) =>
    isActive
      ? 'bg-gray-900 text-white rounded-full px-4 py-1.5 text-sm font-medium'
      : 'text-gray-600 hover:text-gray-900 px-4 py-1.5 text-sm font-medium rounded-full hover:bg-gray-100';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center h-14 px-4 gap-2">
        {/* Nav */}
        <nav className="flex items-center gap-1 flex-1 min-w-0">
          {shopId ? (
            <>
              {/* Shop selector dropdown */}
              <div className="relative flex-shrink-0" ref={dropdownRef}>
                <button
                  onClick={() => setShopDropdownOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-full"
                >
                  <span className="truncate max-w-32">{currentShop?.name ?? '…'}</span>
                  <ChevronDown
                    size={14}
                    className={`flex-shrink-0 transition-transform duration-150 ${shopDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {shopDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-48 z-50">
                    {(myShops?.shops ?? []).map((shop) => (
                      <button
                        key={shop.id}
                        onClick={() => { navigate(`/shops/${shop.id}`); setShopDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          shop.id === shopId
                            ? 'text-gray-900 font-medium bg-gray-50'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {shop.name}
                      </button>
                    ))}
                    <div className="border-t border-gray-200 mt-1 pt-1">
                      <button
                        onClick={() => { navigate('/shops'); setShopDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                      >
                        {t('nav.myShops')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <span className="text-gray-300 mx-1">·</span>

              {/* Shop-level tabs */}
              <NavLink to={`/shops/${shopId}/orders`} className={({ isActive }) => navPillClass(isActive)}>
                {t('nav.orders')}
              </NavLink>
              <NavLink to={`/shops/${shopId}`} end className={({ isActive }) => navPillClass(isActive)}>
                {t('nav.products')}
              </NavLink>
              <NavLink to={`/shops/${shopId}/categories`} className={({ isActive }) => navPillClass(isActive)}>
                {t('nav.categories')}
              </NavLink>
              <NavLink to={`/shops/${shopId}/subscription`} className={({ isActive }) => navPillClass(isActive)}>
                {t('nav.subscription')}
              </NavLink>
              {isOwner && (
                <NavLink to={`/shops/${shopId}/settings`} className={({ isActive }) => navPillClass(isActive)}>
                  {t('nav.settings')}
                </NavLink>
              )}
            </>
          ) : (
            <NavLink to="/shops" className={({ isActive }) => navPillClass(isActive)}>
              {t('nav.myShops')}
            </NavLink>
          )}
        </nav>

        {/* Right side: language + avatar + sign out */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex gap-0.5">
            {(['en', 'de'] as const).map((lng) => (
              <button
                key={lng}
                onClick={() => i18n.changeLanguage(lng)}
                className={`px-2 py-0.5 rounded text-xs font-medium uppercase transition-colors ${
                  i18n.resolvedLanguage === lng
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {lng}
              </button>
            ))}
          </div>

          <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
            <span className="text-xs font-semibold text-white">
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </span>
          </div>

          <button
            onClick={() => instance.logoutRedirect()}
            title={t('nav.signOut')}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
