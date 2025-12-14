
import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LogoutIcon } from '../../../shared/components/icons';

const LogoutButton: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("persist:auth");
    dispatch({ type: "auth/logout" });
    navigate("/login", { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm w-full text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
    >
      <LogoutIcon className="w-5 h-5" />
      <span>Logout</span>
    </button>
  );
};

export default LogoutButton;
