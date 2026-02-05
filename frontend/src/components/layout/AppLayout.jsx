import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const AppLayout = () => {
    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main style={{
                flex: 1,
                marginLeft: 'var(--sidebar-width)',
                padding: '2rem',
                minHeight: '100vh',
                backgroundColor: 'var(--bg-app)'
            }}>
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;
