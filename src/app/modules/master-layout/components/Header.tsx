import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header className="h-16 bg-nbs-red text-white flex items-center px-4 shadow-sm">
      <div className="flex items-center gap-4 w-full max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center text-nbs-red font-bold">
            NB
          </div>
          <div className="text-lg font-semibold">National Bookstore – CPT</div>
        </Link>

        <nav className="ml-auto flex items-center gap-4">
          <Link to="/" className="text-white hover:text-nbs-accent transition-colors">
            Dashboard
          </Link>

          <Link to="/users" className="text-white hover:text-nbs-accent transition-colors">
            Users
          </Link>

          <Link to="/payments" className="hidden md:inline text-white hover:text-nbs-accent transition-colors">
            Payments
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;