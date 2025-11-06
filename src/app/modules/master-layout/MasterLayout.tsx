import React, { ReactNode } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Outlet } from "react-router-dom";

interface MasterLayoutProps {
  children?: ReactNode;
}

const MasterLayout: React.FC<MasterLayoutProps> = () => {
  return (
    <div className="flex flex-col flex-1 text-center h-screen min-h-screen">
      {/* Header */}
      <header>
        <Header />
      </header>
      {/* Main Content */}
      <main>
        <Outlet />
      </main>
      {/* Footer */}
      <footer className="relative">
        <Footer />
      </footer>
    </div>
  );
}

export default MasterLayout;