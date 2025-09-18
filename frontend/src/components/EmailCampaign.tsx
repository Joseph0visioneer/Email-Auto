/**
 * Email Campaign Component
 * 이메일 템플릿 선택, 미리보기, 대량 발송 관리
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface EmailTemplate {
    id: number;
    name: string;
    subject: string;
    body: string;
    attendee_type?: string;
}

interface Attendee {
    id: number;
    name: string;
    email: string;
    company?: string;
    position?: string;
    attendee_type?: string;
}

interface CampaignData {
    event_name: string;
    event_date: string;
    venue: string;
    event_time: string;
    sender_name: string;
}

const EmailCampaign: React.FC = () => {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [filteredAttendees, setFilteredAttendees] = useState<Attendee[]>([]);
    const [campaignData, setCampaignData] = useState<CampaignData>({
        event_name: 'AI & Technology Conference 2024',
        event_date: '2024년 10월 15일',
        venue: '서울 코엑스 컨벤션센터',
        event_time: '오전 9:00 - 오후 6:00',
        sender_name: 'Email Automation System'
    });
    const [selectedAttendeeTypes, setSelectedAttendeeTypes] = useState<string[]>(['all']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sendResults, setSendResults] = useState<any>(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

    // 템플릿 로드
    useEffect(() => {
        loadTemplates();
        loadAttendees();
    }, []);

    // 참석자 필터링
    useEffect(() => {
        if (selectedAttendeeTypes.includes('all')) {
            setFilteredAttendees(attendees);
        } else {
            setFilteredAttendees(attendees.filter(a => 
                selectedAttendeeTypes.includes(a.attendee_type || 'attendee')
            ));
        }
    }, [attendees, selectedAttendeeTypes]);

    const loadTemplates = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/emails/templates`);
            setTemplates(response.data.templates || []);
        } catch (err) {
            console.error('템플릿 로드 실패:', err);
        }
    };

    const loadAttendees = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/attendees/`);
            setAttendees(response.data.attendees || []);
        } catch (err) {
            console.error('참석자 로드 실패:', err);
        }
    };

    const testTemplate = async () => {
        if (!selectedTemplate) return;

        setLoading(true);
        try {
            // 샘플 참석자 데이터
            const sampleAttendee = filteredAttendees[0] || {
                name: '홍길동',
                email: 'sample@example.com',
                company: '샘플 회사',
                position: '개발자',
                attendee_type: 'attendee'
            };

            const sampleData = {
                ...campaignData,
                ...sampleAttendee
            };

            const response = await axios.post(`${API_BASE_URL}/emails/test-template`, {
                template: {
                    subject: selectedTemplate.subject,
                    body: selectedTemplate.body
                },
                sample_data: sampleData
            });

            setPreviewData(response.data.processed_template);
            setPreviewMode(true);
        } catch (err: any) {
            setError(err.response?.data?.error || '템플릿 테스트에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const sendCampaign = async () => {
        if (!selectedTemplate || filteredAttendees.length === 0) {
            setError('템플릿과 수신자를 선택해주세요.');
            return;
        }

        setLoading(true);
        setError(null);
        setSendResults(null);

        try {
            const response = await axios.post(`${API_BASE_URL}/emails/send-bulk`, {
                attendees: filteredAttendees,
                template: {
                    subject: selectedTemplate.subject,
                    body: selectedTemplate.body
                },
                template_data: campaignData
            });

            setSendResults(response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || '이메일 발송에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

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

    const attendeeTypes = [
        { value: 'all', label: '전체', count: attendees.length },
        { value: 'attendee', label: '일반 참석자', count: attendees.filter(a => (a.attendee_type || 'attendee') === 'attendee').length },
        { value: 'speaker', label: '연사', count: attendees.filter(a => a.attendee_type === 'speaker').length },
        { value: 'sponsor', label: '스폰서', count: attendees.filter(a => a.attendee_type === 'sponsor').length },
        { value: 'vip', label: 'VIP', count: attendees.filter(a => a.attendee_type === 'vip').length },
        { value: 'staff', label: '스태프', count: attendees.filter(a => a.attendee_type === 'staff').length }
    ].filter(type => type.count > 0);

    return (
        <div>
            <h3>📧 이메일 캠페인</h3>

            {error && (
                <div style={{
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    padding: '12px',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    border: '1px solid #f5c6cb'
                }}>
                    ❌ {error}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* 왼쪽: 설정 및 템플릿 선택 */}
                <div>
                    {/* 캠페인 설정 */}
                    <div style={{
                        backgroundColor: 'white',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        padding: '20px',
                        marginBottom: '20px'
                    }}>
                        <h4>⚙️ 캠페인 설정</h4>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            <div>
                                <label style={{ fontSize: '14px', fontWeight: '500', color: '#495057' }}>
                                    이벤트명:
                                </label>
                                <input
                                    type="text"
                                    value={campaignData.event_name}
                                    onChange={(e) => setCampaignData({...campaignData, event_name: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '4px',
                                        marginTop: '4px'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#495057' }}>
                                        일정:
                                    </label>
                                    <input
                                        type="text"
                                        value={campaignData.event_date}
                                        onChange={(e) => setCampaignData({...campaignData, event_date: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            border: '1px solid #dee2e6',
                                            borderRadius: '4px',
                                            marginTop: '4px'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#495057' }}>
                                        시간:
                                    </label>
                                    <input
                                        type="text"
                                        value={campaignData.event_time}
                                        onChange={(e) => setCampaignData({...campaignData, event_time: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            border: '1px solid #dee2e6',
                                            borderRadius: '4px',
                                            marginTop: '4px'
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '14px', fontWeight: '500', color: '#495057' }}>
                                    장소:
                                </label>
                                <input
                                    type="text"
                                    value={campaignData.venue}
                                    onChange={(e) => setCampaignData({...campaignData, venue: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '4px',
                                        marginTop: '4px'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 수신자 선택 */}
                    <div style={{
                        backgroundColor: 'white',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        padding: '20px',
                        marginBottom: '20px'
                    }}>
                        <h4>👥 수신자 선택 ({filteredAttendees.length}명)</h4>
                        <div style={{ display: 'grid', gap: '8px' }}>
                            {attendeeTypes.map(type => (
                                <label key={type.value} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '8px',
                                    backgroundColor: selectedAttendeeTypes.includes(type.value) ? '#e3f2fd' : '#f8f9fa',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedAttendeeTypes.includes(type.value)}
                                        onChange={(e) => {
                                            if (type.value === 'all') {
                                                setSelectedAttendeeTypes(e.target.checked ? ['all'] : []);
                                            } else {
                                                const newTypes = e.target.checked 
                                                    ? [...selectedAttendeeTypes.filter(t => t !== 'all'), type.value]
                                                    : selectedAttendeeTypes.filter(t => t !== type.value);
                                                setSelectedAttendeeTypes(newTypes.length === 0 ? ['all'] : newTypes);
                                            }
                                        }}
                                        style={{ marginRight: '8px' }}
                                    />
                                    <span>{type.label} ({type.count}명)</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 템플릿 선택 */}
                    <div style={{
                        backgroundColor: 'white',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        padding: '20px'
                    }}>
                        <h4>📝 이메일 템플릿</h4>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {templates.map(template => (
                                <div
                                    key={template.id}
                                    onClick={() => setSelectedTemplate(template)}
                                    style={{
                                        padding: '16px',
                                        backgroundColor: selectedTemplate?.id === template.id ? '#e3f2fd' : '#f8f9fa',
                                        border: selectedTemplate?.id === template.id ? '2px solid #007bff' : '1px solid #dee2e6',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <h5 style={{ margin: '0 0 8px 0' }}>{template.name}</h5>
                                            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                                                {template.subject}
                                            </p>
                                            <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>
                                                {template.body.substring(0, 100)}...
                                            </p>
                                        </div>
                                        {template.attendee_type && (
                                            <span style={{
                                                backgroundColor: getTypeColor(template.attendee_type),
                                                color: 'white',
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                fontSize: '10px',
                                                fontWeight: '500',
                                                textTransform: 'uppercase',
                                                marginLeft: '8px'
                                            }}>
                                                {template.attendee_type}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 오른쪽: 미리보기 및 발송 */}
                <div>
                    {selectedTemplate && (
                        <div style={{
                            backgroundColor: 'white',
                            border: '1px solid #dee2e6',
                            borderRadius: '8px',
                            padding: '20px',
                            marginBottom: '20px'
                        }}>
                            <h4>👀 이메일 미리보기</h4>
                            
                            {!previewMode ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <p style={{ color: '#666', marginBottom: '16px' }}>
                                        템플릿 미리보기를 확인하세요
                                    </p>
                                    <button
                                        onClick={testTemplate}
                                        disabled={loading}
                                        style={{
                                            padding: '12px 24px',
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: loading ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {loading ? '🔄 처리 중...' : '👁️ 미리보기'}
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div style={{
                                        borderBottom: '1px solid #eee',
                                        paddingBottom: '12px',
                                        marginBottom: '16px'
                                    }}>
                                        <strong>제목:</strong>
                                        <div style={{
                                            backgroundColor: '#f8f9fa',
                                            padding: '8px',
                                            borderRadius: '4px',
                                            marginTop: '4px',
                                            fontFamily: 'monospace',
                                            fontSize: '14px'
                                        }}>
                                            {previewData?.subject}
                                        </div>
                                    </div>
                                    
                                    <strong>본문:</strong>
                                    <div style={{
                                        backgroundColor: '#f8f9fa',
                                        padding: '16px',
                                        borderRadius: '4px',
                                        marginTop: '8px',
                                        whiteSpace: 'pre-line',
                                        fontFamily: 'monospace',
                                        fontSize: '14px',
                                        lineHeight: '1.5',
                                        maxHeight: '300px',
                                        overflow: 'auto'
                                    }}>
                                        {previewData?.body}
                                    </div>
                                    
                                    <button
                                        onClick={() => setPreviewMode(false)}
                                        style={{
                                            marginTop: '12px',
                                            padding: '8px 16px',
                                            backgroundColor: '#6c757d',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        🔄 다시 생성
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 발송 결과 */}
                    {sendResults && (
                        <div style={{
                            backgroundColor: 'white',
                            border: '1px solid #dee2e6',
                            borderRadius: '8px',
                            padding: '20px',
                            marginBottom: '20px'
                        }}>
                            <h4>📊 발송 결과</h4>
                            
                            <div style={{
                                backgroundColor: sendResults.success_count > 0 ? '#d4edda' : '#f8d7da',
                                border: `1px solid ${sendResults.success_count > 0 ? '#c3e6cb' : '#f5c6cb'}`,
                                borderRadius: '4px',
                                padding: '16px',
                                marginBottom: '16px'
                            }}>
                                <div style={{ marginBottom: '8px' }}>
                                    <strong>📈 전체 발송 통계:</strong>
                                </div>
                                <ul style={{ margin: '0 0 0 20px' }}>
                                    <li>총 대상자: {sendResults.total}명</li>
                                    <li>발송 성공: {sendResults.success_count}명</li>
                                    <li>발송 실패: {sendResults.failure_count}명</li>
                                    <li>성공률: {Math.round((sendResults.success_count / sendResults.total) * 100)}%</li>
                                </ul>
                            </div>

                            {sendResults.failure_count > 0 && (
                                <div>
                                    <strong>❌ 실패한 발송:</strong>
                                    <div style={{
                                        maxHeight: '200px',
                                        overflow: 'auto',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '4px',
                                        marginTop: '8px'
                                    }}>
                                        {sendResults.results
                                            .filter((result: any) => !result.success)
                                            .map((result: any, index: number) => (
                                            <div key={index} style={{
                                                padding: '8px',
                                                borderBottom: index < sendResults.results.length - 1 ? '1px solid #f1f3f4' : 'none',
                                                fontSize: '12px'
                                            }}>
                                                <strong>{result.attendee_name}</strong> ({result.recipient})<br/>
                                                <span style={{ color: '#dc3545' }}>{result.error}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 발송 버튼 */}
                    {selectedTemplate && filteredAttendees.length > 0 && (
                        <div style={{
                            backgroundColor: 'white',
                            border: '1px solid #dee2e6',
                            borderRadius: '8px',
                            padding: '20px'
                        }}>
                            <h4>🚀 이메일 발송</h4>
                            <p style={{ color: '#666', marginBottom: '16px' }}>
                                {filteredAttendees.length}명에게 "{selectedTemplate.name}" 템플릿으로 이메일을 발송합니다.
                            </p>
                            
                            <button
                                onClick={sendCampaign}
                                disabled={loading || !selectedTemplate}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    backgroundColor: loading ? '#6c757d' : '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                }}
                            >
                                {loading ? '📤 이메일 발송 중...' : '📤 이메일 발송하기'}
                            </button>
                            
                            <div style={{
                                fontSize: '12px',
                                color: '#666',
                                marginTop: '8px',
                                textAlign: 'center'
                            }}>
                                ⚠️ 현재 테스트 모드입니다. 실제 이메일은 발송되지 않습니다.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmailCampaign;
