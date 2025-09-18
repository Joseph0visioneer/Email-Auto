/**
 * Simple Layout Component
 * 간단한 레이아웃으로 빠르게 시작
 */

import React from 'react';

interface SimpleLayoutProps {
    children: React.ReactNode;
    title?: string;
}

const SimpleLayout: React.FC<SimpleLayoutProps> = ({ children, title = 'Email Automation' }) => {
    return (
        <div style={{ 
            minHeight: '100vh', 
            backgroundColor: '#f5f5f5',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            <header style={{
                backgroundColor: 'white',
                padding: '1rem 2rem',
                borderBottom: '1px solid #e0e0e0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{ margin: 0, color: '#333' }}>{title}</h1>
            </header>
            
            <main style={{ padding: '2rem' }}>
                {children}
            </main>
        </div>
    );
};

export default SimpleLayout;
