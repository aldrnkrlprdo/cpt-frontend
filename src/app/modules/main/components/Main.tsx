import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../master-layout/components/Header';
import Sidebar from '../../master-layout/components/Sidebar';

const Main: React.FC = () => {
    return (
        <div className="flex flex-col h-screen">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-4 bg-gray-100">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default Main;