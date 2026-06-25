import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Contact from './pages/Contact';
import Wallet from './pages/Wallet';
import LookBook from './pages/LookBook';
import AddLookBook from './pages/AddLookBook';
import EditLookBook from './pages/EditLookBook';
import CollectionPage from './pages/Collection';
import AddCollection from './pages/AddCollection';
import EditCollection from './pages/EditCollection';
import CategoryPage from './pages/Category';
import AddCategory from './pages/AddCategory';
import EditCategory from './pages/EditCategory';
import ProductPage from './pages/Product';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import VariantPage from './pages/Variant';
import AddVariant from './pages/AddVariant';
import EditVariant from './pages/EditVariant';
import InventoryPage from './pages/Inventory';

import BulkProduct from './pages/BulkProduct';
import AddBulkProduct from './pages/AddBulkProduct';
import EditBulkProduct from './pages/EditBulkProduct';
import BulkProductVariants from './pages/BulkProductVariants';
import AddBulkProductVariant from './pages/AddBulkProductVariant';
import EditBulkProductVariant from './pages/EditBulkProductVariant';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';

function App() {
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);

  return (
    <ChakraProvider value={defaultSystem}>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          <Route
            path="/signup"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />}
          />
          <Route
            path="/forgot-password"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />}
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <ProtectedRoute>
                <Contact />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lookbook"
            element={
              <ProtectedRoute>
                <LookBook />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lookbook/add"
            element={
              <ProtectedRoute>
                <AddLookBook />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lookbook/edit/:id"
            element={
              <ProtectedRoute>
                <EditLookBook />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collection"
            element={
              <ProtectedRoute>
                <CollectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collection/add"
            element={
              <ProtectedRoute>
                <AddCollection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collection/edit/:id"
            element={
              <ProtectedRoute>
                <EditCollection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/category"
            element={
              <ProtectedRoute>
                <CategoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/category/add"
            element={
              <ProtectedRoute>
                <AddCategory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/category/edit/:id"
            element={
              <ProtectedRoute>
                <EditCategory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product"
            element={
              <ProtectedRoute>
                <ProductPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product/add"
            element={
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product/edit/:id"
            element={
              <ProtectedRoute>
                <EditProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/variant"
            element={
              <ProtectedRoute>
                <VariantPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/variant/add"
            element={
              <ProtectedRoute>
                <AddVariant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/variant/edit/:id"
            element={
              <ProtectedRoute>
                <EditVariant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <InventoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bulk-product"
            element={
              <ProtectedRoute>
                <BulkProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bulk-product/add"
            element={
              <ProtectedRoute>
                <AddBulkProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bulk-product/edit/:id"
            element={
              <ProtectedRoute>
                <EditBulkProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bulk-product/:productId/variants"
            element={
              <ProtectedRoute>
                <BulkProductVariants />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bulk-product/:productId/variants/add"
            element={
              <ProtectedRoute>
                <AddBulkProductVariant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bulk-product/:productId/variants/edit/:variantId"
            element={
              <ProtectedRoute>
                <EditBulkProductVariant />
              </ProtectedRoute>
            }
          />

          {/* Root Route */}
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;
