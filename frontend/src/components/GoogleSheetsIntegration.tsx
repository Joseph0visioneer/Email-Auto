/**
 * Google Sheets Integration Component
 * Google Sheets와 연동하여 참석자 데이터를 가져오는 컴포넌트
 */

import React, { useState } from 'react';
import axios from 'axios';

interface Attendee {
    id: number;
    name: string;
    email: string;
    company?: string;
    position?: string;
    attendee_type?: string;
}

interface GoogleSheetsData {
    attendees: Attendee[];
    total_rows: number;
    valid_attendees: number;
}

const GoogleSheetsIntegration: React.FC = () => {
    const [sheetsUrl, setSheetsUrl] = useState('');
    const [spreadsheetId, setSpreadsheetId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [importedData, setImportedData] = useState<GoogleSheetsData | null>(null);
    const [previewData, setPreviewData] = useState<any>(null);
    const [step, setStep] = useState<'input' | 'preview' | 'import' | 'complete'>('input');

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

    const extractSpreadsheetId = async (url: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${API_BASE_URL}/google-sheets/extract-spreadsheet-id`, {
                url: url
            });

            if (response.data.success) {
                setSpreadsheetId(response.data.spreadsheet_id);
                return response.data.spreadsheet_id;
            } else {
                throw new Error(response.data.error);
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.message || '스프레드시트 ID 추출에 실패했습니다.';
            setError(errorMsg);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const testConnection = async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${API_BASE_URL}/google-sheets/test-connection`, {
                spreadsheet_id: id
            });

            if (response.data.success) {
                return true;
            } else {
                throw new Error(response.data.error);
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.message || '연결 테스트에 실패했습니다.';
            setError(errorMsg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const previewSheetData = async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${API_BASE_URL}/google-sheets/preview-data`, {
                spreadsheet_id: id,
                range: 'A1:Z10'
            });

            if (response.data.success) {
                setPreviewData(response.data);
                setStep('preview');
                return true;
            } else {
                throw new Error(response.data.error);
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.message || '데이터 미리보기에 실패했습니다.';
            setError(errorMsg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const importAttendees = async () => {
        setLoading(true);
        setError(null);
        setStep('import');

        try {
            const response = await axios.post(`${API_BASE_URL}/google-sheets/import-attendees`, {
                spreadsheet_id: spreadsheetId,
                range: 'A:Z'
            });

            if (response.data.success) {
                setImportedData({
                    attendees: response.data.attendees,
                    total_rows: response.data.total_rows,
                    valid_attendees: response.data.valid_attendees
                });
                setStep('complete');
                return true;
            } else {
                throw new Error(response.data.error);
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.message || '데이터 가져오기에 실패했습니다.';
            setError(errorMsg);
            setStep('preview');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleUrlSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!sheetsUrl.trim()) {
            setError('Google Sheets URL을 입력해주세요.');
            return;
        }

        // 1. URL에서 스프레드시트 ID 추출
        const extractedId = await extractSpreadsheetId(sheetsUrl);
        if (!extractedId) return;

        // 2. 연결 테스트
        const isConnected = await testConnection(extractedId);
        if (!isConnected) return;

        // 3. 데이터 미리보기
        await previewSheetData(extractedId);
    };

    const resetProcess = () => {
        setSheetsUrl('');
        setSpreadsheetId('');
        setError(null);
        setImportedData(null);
        setPreviewData(null);
        setStep('input');
    };

    const renderStepIndicator = () => (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            {['input', 'preview', 'import', 'complete'].map((s, index) => (
                <React.Fragment key={s}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: step === s ? '#007bff' : (index < ['input', 'preview', 'import', 'complete'].indexOf(step) ? '#28a745' : '#e9ecef'),
                        color: step === s || index < ['input', 'preview', 'import', 'complete'].indexOf(step) ? 'white' : '#6c757d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }}>
                        {index + 1}
                    </div>
                    {index < 3 && (
                        <div style={{
                            flex: 1,
                            height: '2px',
                            backgroundColor: index < ['input', 'preview', 'import', 'complete'].indexOf(step) ? '#28a745' : '#e9ecef',
                            margin: '0 8px'
                        }} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <div>
            <h3>📊 Google Sheets 연동</h3>
            
            {renderStepIndicator()}

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

            {step === 'input' && (
                <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '24px'
                }}>
                    <h4>1️⃣ Google Sheets URL 입력</h4>
                    <p style={{ color: '#666', marginBottom: '16px' }}>
                        참석자 정보가 포함된 Google Sheets의 URL을 입력하세요.
                    </p>
                    
                    <form onSubmit={handleUrlSubmit}>
                        <div style={{ marginBottom: '16px' }}>
                            <input
                                type="url"
                                value={sheetsUrl}
                                onChange={(e) => setSheetsUrl(e.target.value)}
                                placeholder="https://docs.google.com/spreadsheets/d/..."
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                                disabled={loading}
                            />
                        </div>
                        
                        <div style={{ 
                            backgroundColor: '#f8f9fa', 
                            padding: '12px', 
                            borderRadius: '4px',
                            marginBottom: '16px',
                            fontSize: '14px',
                            color: '#495057'
                        }}>
                            <strong>📋 데이터 형식 요구사항:</strong>
                            <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                                <li>첫 번째 행: 헤더 (이름, 이메일, 회사, 직책, 참석자유형 등)</li>
                                <li>두 번째 행부터: 실제 데이터</li>
                                <li>필수 열: 이름, 이메일</li>
                                <li>선택 열: 회사, 직책, 참석자유형 (attendee, speaker, sponsor, vip, staff)</li>
                            </ul>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading || !sheetsUrl.trim()}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: loading ? '#6c757d' : '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            {loading ? '🔄 연결 중...' : '🔗 연결 및 미리보기'}
                        </button>
                    </form>
                </div>
            )}

            {step === 'preview' && previewData && (
                <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '24px'
                }}>
                    <h4>2️⃣ 데이터 미리보기</h4>
                    <p style={{ color: '#666', marginBottom: '16px' }}>
                        가져올 데이터를 확인하세요. 올바르면 '데이터 가져오기'를 클릭하세요.
                    </p>
                    
                    <div style={{ marginBottom: '16px' }}>
                        <strong>📊 스프레드시트 정보:</strong>
                        <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                            미리보기 행 수: {previewData.total_preview_rows}행
                        </div>
                    </div>

                    {previewData.headers && previewData.headers.length > 0 && (
                        <div style={{ marginBottom: '20px' }}>
                            <strong>📋 헤더:</strong>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '8px',
                                marginTop: '8px'
                            }}>
                                {previewData.headers.map((header: string, index: number) => (
                                    <span key={index} style={{
                                        backgroundColor: '#e9ecef',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '12px'
                                    }}>
                                        {header}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {previewData.sample_rows && previewData.sample_rows.length > 0 && (
                        <div style={{ marginBottom: '20px' }}>
                            <strong>👀 샘플 데이터:</strong>
                            <div style={{
                                marginTop: '8px',
                                border: '1px solid #dee2e6',
                                borderRadius: '4px',
                                overflow: 'auto'
                            }}>
                                <table style={{
                                    width: '100%',
                                    fontSize: '12px',
                                    borderCollapse: 'collapse'
                                }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                            {previewData.headers.map((header: string, index: number) => (
                                                <th key={index} style={{
                                                    padding: '8px',
                                                    textAlign: 'left',
                                                    borderBottom: '1px solid #dee2e6'
                                                }}>
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.sample_rows.map((row: string[], index: number) => (
                                            <tr key={index}>
                                                {row.map((cell: string, cellIndex: number) => (
                                                    <td key={cellIndex} style={{
                                                        padding: '8px',
                                                        borderBottom: '1px solid #f1f3f4'
                                                    }}>
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={importAttendees}
                            disabled={loading}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: loading ? '#6c757d' : '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            {loading ? '🔄 가져오는 중...' : '📥 데이터 가져오기'}
                        </button>
                        
                        <button
                            onClick={resetProcess}
                            disabled={loading}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            🔄 다시 시작
                        </button>
                    </div>
                </div>
            )}

            {step === 'import' && (
                <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '24px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                    <h4>3️⃣ 데이터 가져오는 중...</h4>
                    <p style={{ color: '#666' }}>
                        Google Sheets에서 참석자 데이터를 가져오고 있습니다.
                    </p>
                </div>
            )}

            {step === 'complete' && importedData && (
                <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '24px'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                        <h4>4️⃣ 데이터 가져오기 완료!</h4>
                    </div>
                    
                    <div style={{
                        backgroundColor: '#d4edda',
                        border: '1px solid #c3e6cb',
                        borderRadius: '4px',
                        padding: '16px',
                        marginBottom: '20px'
                    }}>
                        <strong>📊 가져온 데이터 통계:</strong>
                        <ul style={{ margin: '8px 0 0 20px' }}>
                            <li>전체 행 수: {importedData.total_rows}행</li>
                            <li>유효한 참석자: {importedData.valid_attendees}명</li>
                            <li>성공률: {Math.round((importedData.valid_attendees / (importedData.total_rows - 1)) * 100)}%</li>
                        </ul>
                    </div>

                    {importedData.attendees.length > 0 && (
                        <div style={{ marginBottom: '20px' }}>
                            <strong>👥 가져온 참석자 (처음 5명):</strong>
                            <div style={{
                                marginTop: '8px',
                                border: '1px solid #dee2e6',
                                borderRadius: '4px',
                                overflow: 'auto'
                            }}>
                                <table style={{
                                    width: '100%',
                                    fontSize: '12px',
                                    borderCollapse: 'collapse'
                                }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                            <th style={{ padding: '8px', textAlign: 'left' }}>이름</th>
                                            <th style={{ padding: '8px', textAlign: 'left' }}>이메일</th>
                                            <th style={{ padding: '8px', textAlign: 'left' }}>회사</th>
                                            <th style={{ padding: '8px', textAlign: 'left' }}>유형</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {importedData.attendees.slice(0, 5).map((attendee) => (
                                            <tr key={attendee.id}>
                                                <td style={{ padding: '8px' }}>{attendee.name}</td>
                                                <td style={{ padding: '8px' }}>{attendee.email}</td>
                                                <td style={{ padding: '8px' }}>{attendee.company || '-'}</td>
                                                <td style={{ padding: '8px' }}>
                                                    <span style={{
                                                        backgroundColor: attendee.attendee_type === 'speaker' ? '#fd7e14' : 
                                                                         attendee.attendee_type === 'vip' ? '#dc3545' :
                                                                         attendee.attendee_type === 'sponsor' ? '#6f42c1' : '#007bff',
                                                        color: 'white',
                                                        padding: '2px 6px',
                                                        borderRadius: '8px',
                                                        fontSize: '10px',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {attendee.attendee_type || 'attendee'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={resetProcess}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        🔄 새로운 시트 연동하기
                    </button>
                </div>
            )}
        </div>
    );
};

export default GoogleSheetsIntegration;
