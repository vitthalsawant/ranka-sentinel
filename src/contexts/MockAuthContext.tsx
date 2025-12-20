import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthState, LoginCredentials, RegisterData } from '@/types/auth';
import { toast } from 'sonner';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dummy users database (in-memory)
const DUMMY_USERS: User[] = [
  {
    id: 'admin-1',
    fullName: 'Admin User',
    email: 'admin@datamorphosis.in',
    phone: '+91 9876543210',
    role: 'admin',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'customer-1',
    fullName: 'Renka Premices',
    email: 'renka@premices.com',
    phone: '+91 9876543211',
    role: 'customer',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'customer-2',
    fullName: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+91 9876543212',
    role: 'customer',
    createdAt: new Date('2024-01-20'),
  },
  {
    id: 'customer-3',
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+91 9876543213',
    role: 'customer',
    createdAt: new Date('2024-01-25'),
  },
  {
    id: 'customer-4',
    fullName: 'Michael Chen',
    email: 'michael.chen@example.com',
    phone: '+91 9876543214',
    role: 'customer',
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'customer-5',
    fullName: 'Emily Davis',
    email: 'emily.davis@example.com',
    phone: '+91 9876543215',
    role: 'customer',
    createdAt: new Date('2024-02-05'),
  },
];

// Dummy passwords (in production, these would be hashed)
const DUMMY_PASSWORDS: Record<string, string> = {
  'admin@datamorphosis.in': 'password123',
  'renka@premices.com': 'renka123',
  'john.smith@example.com': 'john123',
  'sarah.johnson@example.com': 'sarah123',
  'michael.chen@example.com': 'michael123',
  'emily.davis@example.com': 'emily123',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check localStorage for stored user
        const storedUser = localStorage.getItem('datamorphosis_user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            setAuthState({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          } catch (e) {
            console.error('Error parsing stored user:', e);
            localStorage.removeItem('datamorphosis_user');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
      setAuthState(prev => ({ ...prev, isLoading: false }));
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const email = credentials.email.trim().toLowerCase();
      const password = credentials.password;

      // Check if user exists and password matches
      const user = DUMMY_USERS.find(u => u.email.toLowerCase() === email);
      const correctPassword = DUMMY_PASSWORDS[email];

      if (!user || password !== correctPassword) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        toast.error('Invalid email or password. Please check your credentials.');
        return false;
      }

      // Store user in localStorage
      if (credentials.rememberMe) {
        localStorage.setItem('datamorphosis_user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('datamorphosis_user', JSON.stringify(user));
      }

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success(`Welcome back, ${user.fullName}!`);
      return true;
    } catch (error: any) {
      console.error('Login exception:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      toast.error(error.message || 'Login failed. Please try again.');
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      // Check if email already exists
      const existingUser = DUMMY_USERS.find(u => u.email.toLowerCase() === data.email.trim().toLowerCase());
      if (existingUser) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        toast.error('Email already registered. Please sign in instead.');
        return false;
      }

      // Create new user
      const newUser: User = {
        id: `customer-${Date.now()}`,
        fullName: data.fullName,
        email: data.email.trim().toLowerCase(),
        phone: data.phone,
        role: 'customer',
        createdAt: new Date(),
      };

      // Add to dummy database
      DUMMY_USERS.push(newUser);
      DUMMY_PASSWORDS[newUser.email] = data.password;

      // Auto-login
      localStorage.setItem('datamorphosis_user', JSON.stringify(newUser));
      setAuthState({
        user: newUser,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success('Registration successful! Welcome to Datamorphosis.');
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      toast.error(error.message || 'Registration failed. Please try again.');
      return false;
    }
  };

  const logout = async () => {
    localStorage.removeItem('datamorphosis_user');
    sessionStorage.removeItem('datamorphosis_user');
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    
    toast.success('You have been logged out');
  };

  const updateUser = (updates: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...updates };
      setAuthState(prev => ({ ...prev, user: updatedUser }));
      localStorage.setItem('datamorphosis_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export dummy users for admin dashboard
export const getDummyUsers = () => DUMMY_USERS;

