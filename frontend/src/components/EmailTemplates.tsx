/**
 * Email Templates Component
 * 이메일 템플릿 관리
 */

import React, { useState } from 'react';

interface EmailTemplate {
    id: number;
    name: string;
    subject: string;
    body: string;
    attendee_type?: string;
}

const EmailTemplates: React.FC = () => {
    const [templates] = useState<EmailTemplate[]>([
        {
            id: 1,
            name: '환영 이메일 - 일반 참석자',
            subject: '{{event_name}} 참석을 환영합니다!',
            body: '안녕하세요 {{name}}님,\n\n{{event_name}}에 참석해주셔서 감사합니다.\n\n일정: {{event_date}}\n장소: {{venue}}\n\n감사합니다.',
            attendee_type: 'attendee'
        },
        {
            id: 2,
            name: '연사 환영 이메일',
            subject: '연사로 모셔서 감사합니다 - {{event_name}}',
            body: '{{name}} 님께,\n\n{{event_name}}의 연사로 모셔서 진심으로 감사드립니다.\n\n연사 전용 혜택:\n- 연사 라운지 이용\n- 기술 지원\n- 발표 장비 제공\n\n발표 30분 전에 도착해주시기 바랍니다.\n\n감사합니다.',
            attendee_type: 'speaker'
        },
        {
            id: 3,
            name: 'VIP 초대 이메일',
            subject: 'VIP 초대 - {{event_name}}',
            body: '{{name}} 님께,\n\nVIP 게스트로 {{event_name}}에 초대합니다!\n\nVIP 전용 혜택:\n- VIP 라운지 이용\n- 우선 좌석\n- 네트워킹 리셉션\n- 연사와의 만남\n\n특별한 시간이 되기를 바랍니다.\n\nVIP 관계팀 드림',
            attendee_type: 'vip'
        }
    ]);

    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
    const [previewData, setPreviewData] = useState({
        name: 'John Doe',
        event_name: 'AI & Technology Conference 2024',
        event_date: '2024년 10월 15일',
        venue: '서울 코엑스 컨벤션센터'
    });

    const processTemplate = (template: string, data: any): string => {
        let processed = template;
        Object.entries(data).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            processed = processed.replace(regex, value as string);
        });
        return processed;
    };

    const getTypeColor = (type?: string) => {
        const colors: { [key: string]: string } = {
            speaker: '#fd7e14',
            attendee: '#007bff',
            sponsor: '#6f42c1',
            staff: '#6c757d',
            vip: '#dc3545'
        };
        return colors[type || 'attendee'] || '#007bff';
    };

    return (
        <div>
            <h3>📧 이메일 템플릿 관리</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* 템플릿 목록 */}
                <div>
                    <h4>템플릿 목록</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {templates.map((template) => (
                            <div 
                                key={template.id}
                                style={{
                                    backgroundColor: selectedTemplate?.id === template.id ? '#e3f2fd' : 'white',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onClick={() => setSelectedTemplate(template)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <h5 style={{ margin: '0 0 8px 0', color: '#333' }}>
                                            {template.name}
                                        </h5>
                                        <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
                                            {template.subject}
                                        </p>
                                        <p style={{ margin: '0', color: '#999', fontSize: '12px' }}>
                                            {template.body.substring(0, 80)}...
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
                    
                    <button style={{
                        width: '100%',
                        padding: '12px',
                        marginTop: '16px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}>
                        ➕ 새 템플릿 추가
                    </button>
                </div>

                {/* 미리보기 */}
                <div>
                    <h4>템플릿 미리보기</h4>
                    {selectedTemplate ? (
                        <div>
                            {/* 미리보기 데이터 설정 */}
                            <div style={{
                                backgroundColor: '#f8f9fa',
                                border: '1px solid #dee2e6',
                                borderRadius: '8px',
                                padding: '16px',
                                marginBottom: '16px'
                            }}>
                                <h5 style={{ margin: '0 0 12px 0' }}>미리보기 데이터</h5>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    <div>
                                        <label style={{ fontSize: '12px', color: '#666' }}>이름:</label>
                                        <input 
                                            type="text"
                                            value={previewData.name}
                                            onChange={(e) => setPreviewData({...previewData, name: e.target.value})}
                                            style={{
                                                width: '100%',
                                                padding: '4px 8px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                fontSize: '12px'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '12px', color: '#666' }}>이벤트명:</label>
                                        <input 
                                            type="text"
                                            value={previewData.event_name}
                                            onChange={(e) => setPreviewData({...previewData, event_name: e.target.value})}
                                            style={{
                                                width: '100%',
                                                padding: '4px 8px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                fontSize: '12px'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 실제 미리보기 */}
                            <div style={{
                                backgroundColor: 'white',
                                border: '1px solid #dee2e6',
                                borderRadius: '8px',
                                padding: '20px'
                            }}>
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
                                        fontFamily: 'monospace'
                                    }}>
                                        {processTemplate(selectedTemplate.subject, previewData)}
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
                                    lineHeight: '1.5'
                                }}>
                                    {processTemplate(selectedTemplate.body, previewData)}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                                <button style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}>
                                    ✏️ 편집
                                </button>
                                <button style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}>
                                    📤 이메일 발송
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px',
                            color: '#666',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px'
                        }}>
                            👈 왼쪽에서 템플릿을 선택하세요
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmailTemplates;
