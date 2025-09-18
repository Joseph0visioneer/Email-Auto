/**
 * Application Configuration
 * 환경별 설정 관리
 */

export const config = {
    api: {
        baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
    },
    app: {
        name: 'Email Automation System',
        version: '1.0.0',
        environment: process.env.REACT_APP_ENVIRONMENT || 'development',
    },
    features: {
        mockAuth: true, // 개발 환경에서 Mock 인증 사용
        realTimeUpdates: false, // 실시간 업데이트 기능
    }
};
