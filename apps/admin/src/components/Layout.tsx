import React, { useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { renderIcon } from '../utils/iconRenderer';
import {
  FiLogOut,
  FiMenu,
  FiX,
  FiBell,
  FiSearch,
  FiSettings,
  FiActivity,
  FiShoppingCart,
  FiUsers,
  FiDatabase,
  FiMessageSquare,
  FiBriefcase,
  FiImage,
  FiTag,
  FiBox
} from 'react-icons/fi';

interface LayoutProps {
  children: ReactNode;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, path, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
      active
        ? 'bg-blue-50 text-blue-600 font-medium'
        : 'text-gray-700 hover:bg-slate-100'
    }`}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: renderIcon(FiActivity, { size: 20 }), label: 'Dashboard', path: '/dashboard' },
    { icon: renderIcon(FiShoppingCart, { size: 20 }), label: 'Orders', path: '/orders' },
    { icon: renderIcon(FiUsers, { size: 20 }), label: 'Customers', path: '/customers' },
    { icon: renderIcon(FiTag, { size: 20 }), label: 'Collection', path: '/collection' },
    { icon: renderIcon(FiTag, { size: 20 }), label: 'Category', path: '/category' },
    { icon: renderIcon(FiMessageSquare, { size: 20 }), label: 'Contact', path: '/contact' },
    { icon: renderIcon(FiBriefcase, { size: 20 }), label: 'Wallet', path: '/wallet' },
    { icon: renderIcon(FiImage, { size: 20 }), label: 'LookBook', path: '/lookbook' },
    { icon: renderIcon(FiDatabase, { size: 20 }), label: 'Products', path: '/product' },
    { icon: renderIcon(FiBox, { size: 20 }), label: 'Bulk Products', path: '/bulk-product' },
    { icon: renderIcon(FiBox, { size: 20 }), label: 'Inventory', path: '/inventory' }
  ];

  // These routes don't exist yet, so the section is hidden until they're built.
  const settingsItems: { icon: React.ReactNode; label: string; path: string }[] = [];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar - Static */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } fixed lg:relative w-64 h-screen bg-white border-r border-slate-200 transition-transform duration-300 z-30 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center gap-4 px-6 border-b border-slate-200">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-white">KT</span>
          </div>
          <h1 className="text-lg font-bold text-gray-800">Admin</h1>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">
            Main Menu
          </div>

          {menuItems.map(item => (
            <NavItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              active={isActive(item.path)}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
            />
          ))}

          {settingsItems.length > 0 && (
            <>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider my-4 px-3">
                Settings
              </div>

              {settingsItems.map(item => (
                <NavItem
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  path={item.path}
                  active={isActive(item.path)}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                />
              ))}
            </>
          )}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <div className="bg-white border-b border-slate-200 shadow-sm h-16 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
            >
              {sidebarOpen ? renderIcon(FiX, { size: 24 }) : renderIcon(FiMenu, { size: 24 })}
            </button>
            <h1 className="text-xl font-bold text-gray-800 hidden sm:block">Admin Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg">
              <span className="text-gray-500">{renderIcon(FiSearch, { size: 18 })}</span>
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none text-sm w-32 placeholder-gray-500"
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative">
                {renderIcon(FiBell, { size: 20 })}
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>

            {/* Settings */}
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              {renderIcon(FiSettings, { size: 20 })}
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-10 h-10 rounded-full"
              />
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
              >
                {renderIcon(FiLogOut, { size: 20 })}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
