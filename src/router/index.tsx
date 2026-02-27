import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { RequireAuth } from '../components/auth/RequireAuth';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ShopsPage } from '../pages/ShopsPage';
import { CreateShopPage } from '../pages/CreateShopPage';
import { ShopDetailPage } from '../pages/ShopDetailPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { CreateCategoryPage } from '../pages/CreateCategoryPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CreateProductPage } from '../pages/CreateProductPage';
import { EditProductPage } from '../pages/EditProductPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/shops', element: <ShopsPage /> },
          { path: '/shops/new', element: <CreateShopPage /> },
          { path: '/shops/:shopId', element: <ShopDetailPage /> },
          { path: '/shops/:shopId/categories', element: <CategoriesPage /> },
          { path: '/shops/:shopId/categories/new', element: <CreateCategoryPage /> },
          { path: '/shops/:shopId/products', element: <ProductsPage /> },
          { path: '/shops/:shopId/products/new', element: <CreateProductPage /> },
          { path: '/shops/:shopId/products/:productId', element: <EditProductPage /> },
        ],
      },
    ],
  },
]);
