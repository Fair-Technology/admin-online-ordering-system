import { useParams, NavLink, Outlet } from 'react-router-dom';
import { useGetShopByIdQuery } from '../../store/api/generatedApi';

export function ShopLayout() {
  const { shopId } = useParams<{ shopId: string }>();
  const { data: shop, isLoading, isError } = useGetShopByIdQuery({ shopId: shopId! });

  if (isLoading) return <p className="text-gray-500">Loading shop...</p>;
  if (isError || !shop) return <p className="text-red-500">Failed to load shop.</p>;

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'px-4 py-2 text-sm font-medium border-b-2 border-blue-600 text-blue-600'
      : 'px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700';

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{shop.name}</h1>
      <p className="text-sm text-gray-500 mb-4">ID: {shop.id} · /{shop.slug}</p>

      <div className="flex border-b border-gray-200 mb-6">
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
