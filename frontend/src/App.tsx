import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { CalculatorPage } from './pages/dashboard/CalculatorPage';
import { CustomersPage } from './pages/dashboard/CustomersPage';
import { CustomOrdersPage } from './pages/dashboard/CustomOrdersPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { GoldRatesPage } from './pages/dashboard/GoldRatesPage';
import { InventoryFormPage } from './pages/dashboard/InventoryFormPage';
import { InventoryPage } from './pages/dashboard/InventoryPage';
import { ReportsPage } from './pages/dashboard/ReportsPage';
import { SalesPage } from './pages/dashboard/SalesPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterShopPage } from './pages/auth/RegisterShopPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/inventory', element: <InventoryPage /> },
          { path: '/inventory/new', element: <InventoryFormPage /> },
          { path: '/inventory/:id/edit', element: <InventoryFormPage /> },
          { path: '/gold-rates', element: <GoldRatesPage /> },
          { path: '/customers', element: <CustomersPage /> },
          { path: '/sales', element: <SalesPage /> },
          { path: '/calculator', element: <CalculatorPage /> },
          { path: '/custom-orders', element: <CustomOrdersPage /> },
          { path: '/reports', element: <ReportsPage /> },
        ],
      },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register-shop', element: <RegisterShopPage /> },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
