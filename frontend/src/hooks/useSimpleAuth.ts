/**
 * Simple Auth Hook
 * 간단한 인증 상태 관리
 */

import { useState } from 'react';

interface User {
    uid: string;
    email: string;
    displayName?: string;
}

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

export const useSimpleAuth = () => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        loading: false,
        error: null,
    });

    const mockLogin = async (email: string) => {
        setAuthState(prev => ({ ...prev, loading: true, error: null }));
        
        try {
            // Mock login simulation
            const mockUser: User = {
                uid: 'mock-uid-12345',
                email: email,
                displayName: 'Test User'
            };
            
            setAuthState({
                user: mockUser,
                loading: false,
                error: null,
            });
            
            return mockUser;
        } catch (error) {
            setAuthState(prev => ({
                ...prev,
                loading: false,
                error: 'Login failed'
            }));
            throw error;
        }
    };

    const logout = () => {
        setAuthState({
            user: null,
            loading: false,
            error: null,
        });
    };

    return {
        ...authState,
        mockLogin,
        logout,
    };
};
