/**
 * Dashboard Component
 * 시스템 개요 및 통계 정보
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface DashboardStats {
    totalAttendees: number;
    emailsSent: number;
    templatesCount: number;
    systemStatus: 'healthy' | 'error';
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalAttendees: 0,
        emailsSent: 0,
        templatesCount: 3,
        systemStatus: 'healthy'
    });
    const [loading, setLoading] = useState(true);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // 참석자 수 조회
            const attendeesResponse = await axios.get('http://localhost:5001/api/attendees/');
            const attendeeCount = attendeesResponse.data.attendees?.length || 0;

            // 시스템 상태 확인
            const healthResponse = await axios.get('http://localhost:5001/api/health');
            const isHealthy = healthResponse.data.status === 'healthy';

            setStats({
                totalAttendees: attendeeCount,
                emailsSent: 0, // TODO: 실제 이메일 발송 수 연동
                templatesCount: 3,
                systemStatus: isHealthy ? 'healthy' : 'error'
            });
        } catch (error) {
            setStats(prev => ({ ...prev, systemStatus: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const StatCard: React.FC<{
        title: string;
        value: string | number;
        icon: string;
        color: string;
        description?: string;
    }> = ({ title, value, icon, color, description }) => (
        <div style={{
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                backgroundColor: color
            }} />
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                        {title}
                    </p>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: '32px', color: '#333' }}>
                        {value}
                    </h2>
                    {description && (
                        <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>
                            {description}
                        </p>
                    )}
                </div>
                <div style={{ fontSize: '48px', opacity: 0.3 }}>
                    {icon}
                </div>
            </div>
        </div>
    );

    const quickActions = [
        { label: '새 참석자 추가', icon: '👤', action: () => alert('새 참석자 추가 기능 준비 중') },
        { label: '이메일 발송', icon: '📤', action: () => alert('이메일 발송 기능 준비 중') },
        { label: 'Google Sheets 연동', icon: '📊', action: () => alert('Google Sheets 연동 준비 중') },
        { label: '설정', icon: '⚙️', action: () => alert('설정 기능 준비 중') }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0 }}>📊 대시보드</h3>
                <button 
                    onClick={loadDashboardData}
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

            {/* 통계 카드 */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
            }}>
                <StatCard
                    title="총 참석자"
                    value={stats.totalAttendees}
                    icon="👥"
                    color="#007bff"
                    description="등록된 참석자 수"
                />
                <StatCard
                    title="발송된 이메일"
                    value={stats.emailsSent}
                    icon="📧"
                    color="#28a745"
                    description="성공적으로 발송됨"
                />
                <StatCard
                    title="이메일 템플릿"
                    value={stats.templatesCount}
                    icon="📝"
                    color="#fd7e14"
                    description="사용 가능한 템플릿"
                />
                <StatCard
                    title="시스템 상태"
                    value={stats.systemStatus === 'healthy' ? '정상' : '오류'}
                    icon={stats.systemStatus === 'healthy' ? '✅' : '❌'}
                    color={stats.systemStatus === 'healthy' ? '#28a745' : '#dc3545'}
                    description="백엔드 서버 상태"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* 최근 활동 */}
                <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #dee2e6',
                    borderRadius: '12px',
                    padding: '24px'
                }}>
                    <h4 style={{ margin: '0 0 16px 0' }}>📅 최근 활동</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {[
                            { time: '방금 전', action: '시스템 상태 확인 완료', status: 'success' },
                            { time: '2분 전', action: '참석자 데이터 로드 완료', status: 'success' },
                            { time: '5분 전', action: 'API 서버 시작됨', status: 'info' },
                            { time: '10분 전', action: '개발 환경 설정 완료', status: 'info' }
                        ].map((activity, index) => (
                            <div 
                                key={index}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '8px',
                                    borderLeft: `4px solid ${activity.status === 'success' ? '#28a745' : '#007bff'}`
                                }}
                            >
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: activity.status === 'success' ? '#28a745' : '#007bff',
                                    marginRight: '12px'
                                }} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
                                        {activity.action}
                                    </p>
                                    <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                                        {activity.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 빠른 작업 */}
                <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #dee2e6',
                    borderRadius: '12px',
                    padding: '24px'
                }}>
                    <h4 style={{ margin: '0 0 16px 0' }}>⚡ 빠른 작업</h4>
                    <div style={{ display: 'grid', gap: '8px' }}>
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={action.action}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'left'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = '#e9ecef';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                }}
                            >
                                <span style={{ marginRight: '12px', fontSize: '18px' }}>
                                    {action.icon}
                                </span>
                                <span style={{ fontSize: '14px' }}>
                                    {action.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
