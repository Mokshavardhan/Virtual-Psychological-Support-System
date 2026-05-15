import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

interface User {
    id: string;
    name: string;
    email: string;
    picture?: string;
    [key: string]: any;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;
    login: (token: string, user: any) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setIsLoading(true);
            if (firebaseUser) {
                await firebaseUser.getIdToken();
                // We could automatically sync with backend here if we wanted to
                // But usually we do it during login/register call
                // For now, let's check if we have a local session
                const storedUser = localStorage.getItem('user');
                const storedToken = localStorage.getItem('token');
                
                if (storedUser && storedToken) {
                    setUser(JSON.parse(storedUser));
                    setIsAuthenticated(true);
                }
            } else {
                logout();
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = (token: string, userData: any) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsAuthenticated(true);
        setUser(userData);
    };

    const logout = async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
        await signOut(auth).catch(console.error);
    };

    const refreshUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
            console.error('Failed to refresh user profile:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
