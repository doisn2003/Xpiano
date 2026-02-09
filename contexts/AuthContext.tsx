import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { User } from '../lib/authService';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Initialize auth state
        initializeAuth();

        // Listen to auth changes (Supabase real-time)
        const { data: authListener } = authService.onAuthStateChange((newUser) => {
            setUser(newUser);
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    const initializeAuth = async () => {
        try {
            setIsLoading(true);

            // Simply get profile - Supabase handles session internally
            const profile = await authService.getProfile();
            setUser(profile);
        } catch (error) {
            console.error('Auth initialization error:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const response = await authService.login({ email, password });

        if (!response.success) {
            throw new Error(response.message);
        }

        setUser(response.data.user);
    };

    const register = async (data: any) => {
        const response = await authService.register(data);

        if (!response.success) {
            throw new Error(response.message);
        }

        setUser(response.data.user);
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    const refreshUser = async () => {
        const profile = await authService.getProfile();
        setUser(profile);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
