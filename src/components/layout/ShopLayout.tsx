import { useParams, NavLink, Outlet } from 'react-router-dom';
import { useGetShopByIdQuery } from '../../store/api/generatedApi';
import { GlassSpinner } from '../ui/GlassSpinner';

export function ShopLayout() {
  const { shopId } = useParams<{ shopId: string }>();
  const { data: shop, isLoading, isError } = useGetShopByIdQuery({ shopId: shopId! });

  if (isLoading) return <GlassSpinner label="Loading shop..." />;
  if (isError || !shop) return <p className="text-red-400">Failed to load shop.</p>;

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-150 ${
      isActive
        ? 'bg-white/20 text-white backdrop-blur-md border border-white/20'
        : 'text-white/50 hover:text-white hover:bg-white/10'
    }`;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-4">{shop.name}</h1>

      <div className="flex gap-2 mb-6">
        <NavLink to={`/shops/${shopId}`} end className={tabClass}>
          Products
        </NavLink>
        <NavLink to={`/shops/${shopId}/categories`} className={tabClass}>
          Categories
        </NavLink>
        <NavLink to={`/shops/${shopId}/settings`} className={tabClass}>
          Settings
        </NavLink>
      </div>

      <Outlet />
    </div>
  );
}
