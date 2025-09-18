/**
 * Test Page Component
 * API 연결 테스트를 위한 간단한 페이지
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ApiTestResult {
    endpoint: string;
    status: string;
    data?: any;
    error?: string;
}

const TestPage: React.FC = () => {
    const [results, setResults] = useState<ApiTestResult[]>([]);
    const [loading, setLoading] = useState(false);

    const apiTests = [
        {
            name: 'Health Check',
            endpoint: '/health',
            method: 'GET'
        },
        {
            name: 'Mock Login',
            endpoint: '/auth/mock-login',
            method: 'POST',
            data: { email: 'test@example.com' }
        },
        {
            name: 'Attendees List',
            endpoint: '/attendees/',
            method: 'GET'
        },
        {
            name: 'Attendee Types',
            endpoint: '/attendees/types',
            method: 'GET'
        }
    ];

    const runTests = async () => {
        setLoading(true);
        setResults([]);
        
        const baseURL = 'http://localhost:5001/api';
        
        for (const test of apiTests) {
            try {
                const config = {
                    method: test.method.toLowerCase(),
                    url: `${baseURL}${test.endpoint}`,
                    ...(test.data && { data: test.data }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };

                const response = await axios(config);
                
                setResults(prev => [...prev, {
                    endpoint: test.endpoint,
                    status: `✅ ${response.status} OK`,
                    data: response.data
                }]);
            } catch (error: any) {
                setResults(prev => [...prev, {
                    endpoint: test.endpoint,
                    status: `❌ ${error.response?.status || 'Error'}`,
                    error: error.message
                }]);
            }
        }
        
        setLoading(false);
    };

    useEffect(() => {
        runTests();
    }, []);

    return (
        <div>
            <h2>🧪 API Test Dashboard</h2>
            
            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={runTests}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    {loading ? '🔄 Testing...' : '🚀 Run API Tests'}
                </button>
            </div>

            <div style={{ display: 'grid', gap: '15px' }}>
                {results.map((result, index) => (
                    <div 
                        key={index}
                        style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '15px',
                            backgroundColor: result.status.includes('✅') ? '#f8f9fa' : '#fff5f5'
                        }}
                    >
                        <h3 style={{ margin: '0 0 10px 0' }}>
                            {result.endpoint} - {result.status}
                        </h3>
                        
                        {result.data && (
                            <details style={{ marginTop: '10px' }}>
                                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                                    📄 Response Data
                                </summary>
                                <pre style={{
                                    backgroundColor: '#f1f1f1',
                                    padding: '10px',
                                    borderRadius: '4px',
                                    overflow: 'auto',
                                    fontSize: '12px',
                                    marginTop: '10px'
                                }}>
                                    {JSON.stringify(result.data, null, 2)}
                                </pre>
                            </details>
                        )}
                        
                        {result.error && (
                            <div style={{
                                backgroundColor: '#ffe6e6',
                                padding: '10px',
                                borderRadius: '4px',
                                marginTop: '10px',
                                color: '#d00'
                            }}>
                                <strong>Error:</strong> {result.error}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {results.length === 0 && !loading && (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#666'
                }}>
                    Click "Run API Tests" to test backend connectivity
                </div>
            )}

            <div style={{ marginTop: '40px', fontSize: '14px', color: '#666' }}>
                <h3>📋 Test Information:</h3>
                <ul>
                    <li><strong>Backend URL:</strong> http://localhost:5001</li>
                    <li><strong>Frontend URL:</strong> http://localhost:3000</li>
                    <li><strong>Status:</strong> {results.filter(r => r.status.includes('✅')).length}/{apiTests.length} tests passing</li>
                </ul>
            </div>
        </div>
    );
};

export default TestPage;
