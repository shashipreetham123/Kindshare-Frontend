import { Routes, Route, Navigate, useOutletContext } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Browse from './pages/Browse';
import Inventory from './pages/User/Inventory';
import MyProduct from './pages/User/MyProduct';
import Product from './pages/User/Product';
import Request from './pages/User/Request';
import Reserve from './pages/User/Reserve';
import History from './pages/User/History';
import AddProduct from './pages/User/AddProduct';

// Admin Features
import ManageUsers from './pages/Admin/ManageUsers';
import ManageHistory from './pages/Admin/ManageHistory';
import ManageProducts from './pages/Admin/ManageProducts';
import ManageRequestsReserves from './pages/Admin/ManageRequestsReserves';
import AdminSettings from './pages/Admin/AdminSettings';
import UserSettings from './pages/User/UserSettings';

import './App.css';

// Context-aware component for History: switches between user personal history and Admin audit history
function RoleHistoryPage() {
  const context = useOutletContext() || {};
  return context.isAdmin ? <ManageHistory /> : <History />;
}

// Context-aware component for Settings: renders AdminSettings or UserSettings
function RoleSettingsPage() {
  const context = useOutletContext() || {};
  return context.isAdmin ? <AdminSettings /> : <UserSettings />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Dashboard with nested child routes rendered inside its Outlet */}
      <Route path="/dashboard" element={<Dashboard />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="browse" element={<Browse />} />
        <Route path="add-product" element={<AddProduct />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="myproduct/:productId" element={<MyProduct />} />
        <Route path="my-product/:productId" element={<MyProduct />} />
        <Route path="product/:productId" element={<Product />} />
        <Route path="requests" element={<Request />} />
        <Route path="reserves" element={<Reserve />} />
        <Route path="history" element={<RoleHistoryPage />} />
        <Route path="account-settings" element={<RoleSettingsPage />} />

        {/* Admin Specific Routes */}
        <Route path="users" element={<ManageUsers />} />
        <Route path="moderate-products" element={<ManageProducts />} />
        <Route path="transactions" element={<ManageRequestsReserves />} />
      </Route>
    </Routes>
  );
}

export default App;
