import React, { useState } from 'react';
import CleanLayout from './components/Layout/CleanLayout';
import Dashboard from './components/Dashboard';
import TestPage from './pages/TestPage';
import AttendeeList from './components/AttendeeList';
import EmailTemplates from './components/EmailTemplates';
import GoogleSheetsIntegration from './components/GoogleSheetsIntegration';
import EmailCampaign from './components/EmailCampaign';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'test' | 'attendees' | 'templates' | 'sheets' | 'campaign'>('dashboard');

  return (
    <CleanLayout title="🚀 Email Automation System">
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setCurrentPage('dashboard')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: currentPage === 'dashboard' ? '#007bff' : '#f8f9fa',
            color: currentPage === 'dashboard' ? 'white' : '#495057',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📊 대시보드
        </button>
        <button 
          onClick={() => setCurrentPage('test')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: currentPage === 'test' ? '#007bff' : '#f8f9fa',
            color: currentPage === 'test' ? 'white' : '#495057',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🧪 API 테스트
        </button>
        <button 
          onClick={() => setCurrentPage('attendees')}
          style={{
            padding: '10px 20px',
            backgroundColor: currentPage === 'attendees' ? '#007bff' : '#f8f9fa',
            color: currentPage === 'attendees' ? 'white' : '#495057',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          👥 참석자 관리
        </button>
        <button 
          onClick={() => setCurrentPage('templates')}
          style={{
            padding: '10px 20px',
            backgroundColor: currentPage === 'templates' ? '#007bff' : '#f8f9fa',
            color: currentPage === 'templates' ? 'white' : '#495057',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📧 이메일 템플릿
        </button>
        <button 
          onClick={() => setCurrentPage('sheets')}
          style={{
            padding: '10px 20px',
            backgroundColor: currentPage === 'sheets' ? '#007bff' : '#f8f9fa',
            color: currentPage === 'sheets' ? 'white' : '#495057',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📊 Google Sheets
        </button>
        <button 
          onClick={() => setCurrentPage('campaign')}
          style={{
            padding: '10px 20px',
            backgroundColor: currentPage === 'campaign' ? '#007bff' : '#f8f9fa',
            color: currentPage === 'campaign' ? 'white' : '#495057',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🚀 이메일 캠페인
        </button>
      </div>

      {currentPage === 'dashboard' && <Dashboard />}
      {currentPage === 'test' && <TestPage />}
      {currentPage === 'attendees' && <AttendeeList />}
      {currentPage === 'templates' && <EmailTemplates />}
      {currentPage === 'sheets' && <GoogleSheetsIntegration />}
      {currentPage === 'campaign' && <EmailCampaign />}
    </CleanLayout>
  );
}

export default App;
