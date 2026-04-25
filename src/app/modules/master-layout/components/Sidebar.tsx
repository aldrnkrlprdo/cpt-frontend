import React, { useEffect, useState } from 'react';
import LogoutButton from './LogoutButton';
import { NavLink, useLocation } from 'react-router-dom';
import {
  UsersIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  DatabaseIcon,
  ChevronDownIcon,
  DocumentReportIcon, // Import the icon
} from '../../../shared/components/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../../setup/redux/RootReducer';
import { getTokenPayload } from '../../../core/utils/tokenUtils';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(
    location.pathname.startsWith('/master-record') ? 'master-record' : null
  );
  const [isAdmin, setIsAdmin] = useState(false); // Initialize isAdmin state
  const role = useSelector<RootState, string | undefined>(({ auth }) => auth.role);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      const payload = getTokenPayload(token);
      setIsAdmin(payload?.role === 'admin');
    }

    if (role) setIsAdmin(role === 'admin');
  }, [role, token]) // Update isAdmin state when the role changes
  
  const toggleSubMenu = (key: string) => {
    setOpenSubMenu(prev => (prev === key ? null : key));
  };

  const navItems = [
    { path: '/payment-management', label: 'Payment Management', icon: <CreditCardIcon className="w-5 h-5" /> },
    { path: '/loan-management', label: 'Loan Management', icon: <CurrencyDollarIcon className="w-5 h-5" /> },
    { path: '/members', label: 'Employee Management', icon: <UsersIcon className="w-5 h-5" /> },
    { path: '/reports', label: 'Reports', icon: <DocumentReportIcon className="w-5 h-5" />, adminOnly: true },
    {
      key: 'master-record',
      label: 'Master Record',
      icon: <DatabaseIcon className="w-5 h-5" />,
      adminOnly: true,
      subItems: [
        { path: '/master-record/loan-types', label: 'Loan Type' },
        { path: '/master-record/branches', label: 'Branch' },
      ],
    },
    { path: '/user-management', label: 'User Management', icon: <UsersIcon className="w-5 h-5" />, adminOnly: true },
  ];

  const activeLinkClasses = 'bg-nbs-darkred text-white hover:bg-nbs-darkred';
  const linkClasses = 'flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-md hover:bg-nbs-darkred/80 hover:text-white transition-colors duration-200';
  const subLinkClasses = 'pl-12 pr-4 py-2 text-sm block hover:bg-nbs-darkred/80 transition-colors duration-200';

  return (
    <aside className="w-64 bg-white text-nbs-text flex flex-col border-r border-gray-200">
      <div className="h-16 flex items-center justify-center border-b border-gray-200" />
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map(item => {
          if (item.adminOnly && !isAdmin) return null;

          if ('subItems' in item) {
            return (
              <div key={item.key}>
                <button
                  onClick={() => toggleSubMenu(item.key || '')}
                  className={`${linkClasses} w-full justify-between`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <ChevronDownIcon
                    className={`w-5 h-5 transition-transform duration-500 ease-in-out ${openSubMenu === item.key ? 'rotate-180' : ''
                      }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${openSubMenu === item.key ? 'max-h-40' : 'max-h-0'
                    }`}
                >
                  <div className="mt-1 space-y-1">
                    {item.subItems?.map(subItem => (
                      <NavLink
                        key={subItem.path}
                        to={subItem.path}
                        className={({ isActive }) =>
                          `${subLinkClasses} ${isActive ? 'bg-nbs-gray font-semibold' : ''}`
                        }
                      >
                        {subItem.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 mt-auto border-t border-gray-200">
        <LogoutButton />
      </div>
    </aside>
  );
};

export default Sidebar;