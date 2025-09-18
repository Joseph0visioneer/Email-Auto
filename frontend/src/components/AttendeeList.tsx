/**
 * Attendee List Component
 * 참석자 목록 표시 및 관리
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Attendee {
    id: number;
    name: string;
    email: string;
    company?: string;
    position?: string;
    attendee_type?: string;
    created_at?: string;
}

const AttendeeList: React.FC = () => {
    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadAttendees = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.get('http://localhost:5001/api/attendees/');
            setAttendees(response.data.attendees || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAttendees();
    }, []);

    const getTypeColor = (type: string) => {
        const colors: { [key: string]: string } = {
            speaker: '#fd7e14',
            attendee: '#007bff',
            sponsor: '#6f42c1',
            staff: '#6c757d',
            vip: '#dc3545'
        };
        return colors[type] || '#007bff';
    };

    return (
        <div>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <h3>👥 참석자 목록</h3>
                <button 
                    onClick={loadAttendees}
                    disabled={loading}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    {loading ? '🔄 로딩...' : '🔄 새로고침'}
                </button>
            </div>

            {error && (
                <div style={{
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    padding: '12px',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    border: '1px solid #f5c6cb'
                }}>
                    ❌ 에러: {error}
                </div>
            )}

            {attendees.length === 0 && !loading && !error && (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#666',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px'
                }}>
                    📝 참석자가 없습니다
                </div>
            )}

            <div style={{ display: 'grid', gap: '16px' }}>
                {attendees.map((attendee) => (
                    <div 
                        key={attendee.id}
                        style={{
                            backgroundColor: 'white',
                            border: '1px solid #dee2e6',
                            borderRadius: '8px',
                            padding: '20px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                    >
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            marginBottom: '12px'
                        }}>
                            <div>
                                <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>
                                    {attendee.name}
                                </h4>
                                <p style={{ margin: '0 0 4px 0', color: '#666' }}>
                                    📧 {attendee.email}
                                </p>
                                {attendee.company && (
                                    <p style={{ margin: '0 0 4px 0', color: '#666' }}>
                                        🏢 {attendee.company}
                                    </p>
                                )}
                                {attendee.position && (
                                    <p style={{ margin: '0', color: '#666' }}>
                                        💼 {attendee.position}
                                    </p>
                                )}
                            </div>
                            
                            {attendee.attendee_type && (
                                <span style={{
                                    backgroundColor: getTypeColor(attendee.attendee_type),
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    textTransform: 'uppercase'
                                }}>
                                    {attendee.attendee_type}
                                </span>
                            )}
                        </div>
                        
                        <div style={{ 
                            display: 'flex', 
                            gap: '8px',
                            marginTop: '12px'
                        }}>
                            <button style={{
                                padding: '6px 12px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer'
                            }}>
                                ✉️ 이메일 보내기
                            </button>
                            <button style={{
                                padding: '6px 12px',
                                backgroundColor: '#ffc107',
                                color: '#212529',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer'
                            }}>
                                ✏️ 수정
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {attendees.length > 0 && (
                <div style={{
                    marginTop: '20px',
                    padding: '16px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '8px',
                    textAlign: 'center',
                    color: '#495057'
                }}>
                    📊 총 {attendees.length}명의 참석자
                </div>
            )}
        </div>
    );
};

export default AttendeeList;
