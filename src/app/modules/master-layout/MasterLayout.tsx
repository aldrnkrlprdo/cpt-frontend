import React, { ReactNode } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Outlet } from "react-router-dom";

interface MasterLayoutProps {
  children?: ReactNode;
}

const MasterLayout: React.FC<MasterLayoutProps> = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MasterLayout;