/**
 * Clean Layout Component
 * 깨끗하고 간단한 레이아웃
 */

import React from 'react';

interface CleanLayoutProps {
    children: React.ReactNode;
    title?: string;
}

const CleanLayout: React.FC<CleanLayoutProps> = ({ children, title = 'Email Automation' }) => {
    return (
        <div style={{ 
            minHeight: '100vh', 
            backgroundColor: '#f8f9fa',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            {/* Header */}
            <header style={{
                backgroundColor: 'white',
                padding: '1rem 2rem',
                borderBottom: '1px solid #e0e0e0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    <h1 style={{ 
                        margin: 0, 
                        color: '#333',
                        fontSize: '24px',
                        fontWeight: '600'
                    }}>
                        {title}
                    </h1>
                    
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <div style={{
                            padding: '8px 16px',
                            backgroundColor: '#e3f2fd',
                            borderRadius: '20px',
                            fontSize: '14px',
                            color: '#1976d2'
                        }}>
                            🟢 시스템 정상
                        </div>
                    </div>
                </div>
            </header>
            
            {/* Main Content */}
            <main style={{ 
                padding: '2rem',
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%',
                boxSizing: 'border-box'
            }}>
                {children}
            </main>
        </div>
    );
};

export default CleanLayout;
