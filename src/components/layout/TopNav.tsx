import { useState, useRef, useEffect } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { useTranslation } from 'react-i18next';
import {
  ChevronDown, LogOut, Menu, X,
  Package, ClipboardList, Tag, CreditCard, Settings, Store,
} from 'lucide-react';
import { useGetMyShopsQuery, useGetShopByIdQuery } from '../../services/api';

export function TopNav() {
  const { shopId } = useParams<{ shopId?: string }>();
  const { t, i18n } = useTranslation();
  const { instance, accounts } = useMsal();
  const user = accounts[0];
  const navigate = useNavigate();

  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileShopsOpen, setMobileShopsOpen] = useState(false);
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

  // Close drawer on navigation
  useEffect(() => {
    setDrawerOpen(false);
    setMobileShopsOpen(false);
  }, [shopId]);

  const navItemClass = (isActive: boolean) =>
    isActive
      ? 'flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium'
      : 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 text-sm font-medium transition-colors';

  const shopNavItems = shopId ? (
    <>
      <NavLink to={`/shops/${shopId}`} end className={({ isActive }) => navItemClass(isActive)}>
        <Package size={16} className="flex-shrink-0" />
        {t('nav.products')}
      </NavLink>
      <NavLink to={`/shops/${shopId}/orders`} className={({ isActive }) => navItemClass(isActive)}>
        <ClipboardList size={16} className="flex-shrink-0" />
        {t('nav.orders')}
      </NavLink>
      <NavLink to={`/shops/${shopId}/categories`} className={({ isActive }) => navItemClass(isActive)}>
        <Tag size={16} className="flex-shrink-0" />
        {t('nav.categories')}
      </NavLink>
      <NavLink to={`/shops/${shopId}/subscription`} className={({ isActive }) => navItemClass(isActive)}>
        <CreditCard size={16} className="flex-shrink-0" />
        {t('nav.subscription')}
      </NavLink>
      {isOwner && (
        <NavLink to={`/shops/${shopId}/settings`} className={({ isActive }) => navItemClass(isActive)}>
          <Settings size={16} className="flex-shrink-0" />
          {t('nav.settings')}
        </NavLink>
      )}
    </>
  ) : (
    <NavLink to="/shops" className={({ isActive }) => navItemClass(isActive)}>
      <Store size={16} className="flex-shrink-0" />
      {t('nav.myShops')}
    </NavLink>
  );

  // ── Sidebar content (shared between desktop sidebar and mobile drawer) ────────
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Shop selector */}
      <div className="px-3 py-4 border-b border-gray-100">
        {shopId ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShopDropdownOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <span className="truncate">{currentShop?.name ?? '…'}</span>
              <ChevronDown
                size={14}
                className={`flex-shrink-0 ml-1 text-gray-400 transition-transform duration-150 ${shopDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {shopDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                {(myShops?.shops ?? []).map((shop) => (
                  <button
                    key={shop.id}
                    onClick={() => { navigate(`/shops/${shop.id}`); setShopDropdownOpen(false); setDrawerOpen(false); }}
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
                    onClick={() => { navigate('/shops'); setShopDropdownOpen(false); setDrawerOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  >
                    {t('nav.myShops')} →
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="px-3 py-2">
            <p className="text-sm font-semibold text-gray-900">{t('nav.myShops')}</p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {shopNavItems}
      </nav>

      {/* Bottom: language + user + sign out */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-3">
        {/* Language */}
        <div className="flex gap-1 px-1">
          {(['en', 'de'] as const).map((lng) => (
            <button
              key={lng}
              onClick={() => i18n.changeLanguage(lng)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium uppercase transition-colors ${
                i18n.resolvedLanguage === lng
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {lng}
            </button>
          ))}
        </div>

        {/* User row */}
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-white">
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </span>
          </div>
          <span className="flex-1 text-xs text-gray-600 truncate">{user?.name}</span>
          <button
            onClick={() => instance.logoutRedirect()}
            title={t('nav.signOut')}
            className="text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // ── Mobile drawer content (same but with collapsible shop list) ───────────────
  const drawerContent = (
    <div className="flex flex-col h-full">
      {/* Shop selector — collapsible in drawer */}
      <div className="px-3 py-4 border-b border-gray-100">
        {shopId ? (
          <>
            <button
              onClick={() => setMobileShopsOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <span className="truncate">{currentShop?.name ?? '…'}</span>
              <ChevronDown size={14} className={`flex-shrink-0 ml-1 text-gray-400 transition-transform duration-150 ${mobileShopsOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileShopsOpen && (
              <div className="mt-1 mx-1 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                {(myShops?.shops ?? []).map((shop) => (
                  <button
                    key={shop.id}
                    onClick={() => { navigate(`/shops/${shop.id}`); setDrawerOpen(false); setMobileShopsOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      shop.id === shopId
                        ? 'text-gray-900 font-medium bg-white'
                        : 'text-gray-600 hover:bg-white hover:text-gray-900'
                    }`}
                  >
                    {shop.name}
                  </button>
                ))}
                <div className="border-t border-gray-200">
                  <button
                    onClick={() => { navigate('/shops'); setDrawerOpen(false); setMobileShopsOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-500 hover:bg-white hover:text-gray-700 transition-colors"
                  >
                    {t('nav.myShops')} →
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="px-3 py-2">
            <p className="text-sm font-semibold text-gray-900">{t('nav.myShops')}</p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {shopNavItems}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-3">
        <div className="flex gap-1 px-1">
          {(['en', 'de'] as const).map((lng) => (
            <button
              key={lng}
              onClick={() => i18n.changeLanguage(lng)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium uppercase transition-colors ${
                i18n.resolvedLanguage === lng
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {lng}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-white">
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </span>
          </div>
          <span className="flex-1 text-xs text-gray-600 truncate">{user?.name}</span>
          <button
            onClick={() => instance.logoutRedirect()}
            title={t('nav.signOut')}
            className="text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 bg-white border-r border-gray-200 sticky top-0 h-screen overflow-hidden">
        {sidebarContent}
      </aside>

      {/* ── Mobile top bar ──────────────────────────────────────────────── */}
      <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-30 flex items-center h-14 px-4 gap-3">
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <span className="flex-1 text-sm font-semibold text-gray-900 truncate">
          {shopId ? (currentShop?.name ?? '…') : t('nav.myShops')}
        </span>
      </header>

      {/* ── Mobile drawer ───────────────────────────────────────────────── */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer panel */}
          <div className="lg:hidden fixed inset-y-0 left-0 w-64 bg-white z-50 shadow-xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200 flex-shrink-0">
              <span className="text-sm font-semibold text-gray-900 truncate">
                {shopId ? (currentShop?.name ?? '…') : t('nav.myShops')}
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {drawerContent}
            </div>
          </div>
        </>
      )}
    </>
  );
}
