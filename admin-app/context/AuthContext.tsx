import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as api from '@/services/api';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: (token: string) => Promise<void>;
    logout: () => Promise<void>;
    error: string | null;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    login: async () => { },
    loginWithGoogle: async () => { },
    logout: async () => { },
    error: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const data = await api.verifyToken();
            setUser(data.user);
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }

    async function login(email: string, password: string) {
        setError(null);
        try {
            const data = await api.login(email, password);
            setUser(data.user);
        } catch (err: any) {
            setError(err.message || 'Login failed');
            throw err;
        }
    }

    async function loginWithGoogle(token: string) {
        setError(null);
        try {
            const data = await api.loginWithGoogle(token);
            setUser(data.user);
        } catch (err: any) {
            setError(err.message || 'Google login failed');
            throw err;
        }
    }

    async function logout() {
        await api.logout();
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                loginWithGoogle,
                logout,
                error,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
