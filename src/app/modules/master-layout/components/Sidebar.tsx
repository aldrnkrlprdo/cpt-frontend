import React from 'react';
import LogoutButton from './LogoutButton';
import { authService } from '../../../core/services/auth.service';
import { NavLink, useLocation } from 'react-router-dom';
import {
  UsersIcon,
  CogIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
} from '../../../shared/components/icons';
const Sidebar: React.FC = () => {
  const location = useLocation();
  const navItems = [
    { path: '/payment-management', label: 'Payment Management', icon: <CreditCardIcon className="w-5 h-5" /> },
    { path: '/loan-management', label: 'Loan Management', icon: <CurrencyDollarIcon className="w-5 h-5" /> },
    { path: '/members', label: 'Member Management', icon: <UsersIcon className="w-5 h-5" /> },
    { path: '/user-management', label: 'User Management', icon: <CogIcon className="w-5 h-5" />, adminOnly: true }
  ];

  return (
    <div className="w-64 bg-white text-gray-800 flex flex-col border-r border-gray-200">
      <div className="p-4 text-2xl font-bold border-b border-gray-200 text-gray-900">CPT</div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map(item => {
          if (item.adminOnly && !authService.isAdmin()) {
            return null;
          }
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="p-2 border-t border-gray-200">
        <LogoutButton />
      </div>
    </div>
  );
};

export default Sidebar;