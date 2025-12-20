import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthState, LoginCredentials, RegisterData } from '@/types/auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Helper function to fetch user profile and role (optimized - parallel queries, minimal logging)
  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    try {
      // Optimized: Fetch profile and role in parallel for better performance
      const [profileResult, roleResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, user_id, email, full_name, phone, created_at')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle()
      ]);

      const { data: profile, error: profileError } = profileResult;
      const { data: roleData, error: roleError } = roleResult;

      if (profileError) {
        // If profile doesn't exist, return null (silent fail for performance)
        if (profileError.code === 'PGRST116') {
          console.warn('Profile not found for user:', userId);
          return null;
        }
        // Log actual errors for debugging
        console.error('Profile fetch error:', profileError);
        return null;
      }

      if (!profile) {
        return null;
      }

      const role = (roleData?.role as UserRole) || 'customer';

      return {
        id: userId,
        fullName: profile.full_name,
        email: profile.email,
        phone: profile.phone || '',
        role,
        createdAt: new Date(profile.created_at),
      };
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Check session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for admin session first
        const storedAdmin = localStorage.getItem('datamorphosis_admin_user') || 
                           sessionStorage.getItem('datamorphosis_admin_user');
        
        if (storedAdmin) {
          try {
            const adminUser = JSON.parse(storedAdmin);
            console.log('Found stored admin user:', adminUser);
            setAuthState({
              user: adminUser,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          } catch (e) {
            console.error('Error parsing stored admin user:', e);
            // Clear invalid data
            localStorage.removeItem('datamorphosis_admin_user');
            sessionStorage.removeItem('datamorphosis_admin_user');
          }
        }

        // Check Supabase session (only if no admin session)
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setAuthState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        if (session?.user) {
          console.log('Found Supabase session, fetching profile...');
          const user = await fetchUserProfile(session.user.id);
          if (user) {
            setAuthState({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }
        }

        setAuthState(prev => ({ ...prev, isLoading: false }));
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('datamorphosis_admin_user');
        sessionStorage.removeItem('datamorphosis_admin_user');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      } else if (event === 'SIGNED_IN' && session?.user) {
        const user = await fetchUserProfile(session.user.id);
        if (user) {
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const email = credentials.email.trim().toLowerCase();
      const password = credentials.password;

      console.log('Login attempt started:', { email, rememberMe: credentials.rememberMe });

      // Attempt Supabase auth login (works for both admin and regular users)
      // Admin user is now in the database with proper credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      });

      if (error) {
        console.error('Login error:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          name: error.name,
        });
        setAuthState(prev => ({ ...prev, isLoading: false }));

        // Try to auto-confirm email if not confirmed (allow any email to login)
        if (error.message.includes('Email not confirmed') || 
            error.message.includes('email_not_confirmed')) {
          // Auto-confirm email and retry login
          try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser) {
              await supabase.rpc('auto_confirm_user_email', { _user_id: currentUser.id });
              // Retry login
              const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                email: credentials.email.trim().toLowerCase(),
                password: credentials.password,
              });
              if (!retryError && retryData.user) {
                // Success - continue with normal flow
                const user = await fetchUserProfile(retryData.user.id);
                if (user) {
                  if (user.role === 'admin') {
                    if (credentials.rememberMe) {
                      localStorage.setItem('datamorphosis_admin_user', JSON.stringify(user));
                    } else {
                      sessionStorage.setItem('datamorphosis_admin_user', JSON.stringify(user));
                    }
                  }
                  setAuthState({
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                  });
                  toast.success(`Welcome back, ${user.fullName}!`);
                  return true;
                }
              }
            }
          } catch (autoConfirmError) {
            console.warn('Auto-confirm failed:', autoConfirmError);
          }
          toast.error('Please try logging in again. Email confirmation is being processed.');
        } else if (error.message.includes('Invalid login credentials') || 
            error.message.includes('invalid_credentials') ||
            error.message.includes('Invalid login') ||
            error.status === 400) {
          // Provide helpful message for admin user
          if (credentials.email.toLowerCase() === 'admin@datamorphosis.in') {
            toast.error('Admin user not found. Please create the admin user in Supabase Dashboard first. See CREATE_ADMIN_USER.md for instructions.');
            console.error('Admin user does not exist. Create it in Supabase Dashboard: Authentication > Users > Add User');
          } else {
            // Check if user exists in profiles but not in auth.users
            const { data: profileCheck } = await supabase
              .from('profiles')
              .select('email, user_id')
              .eq('email', credentials.email.trim().toLowerCase())
              .maybeSingle();
            
            if (profileCheck) {
              // Check if user exists in auth.users
              const { data: authCheck } = await supabase
                .from('auth.users')
                .select('id, email_confirmed_at')
                .eq('email', credentials.email.trim().toLowerCase())
                .maybeSingle()
                .catch(() => ({ data: null })); // Can't query auth.users directly, try alternative
              
              // Try to get user via RPC or check profile user_id
              if (profileCheck.user_id) {
                // Profile exists with user_id - user might exist but password wrong or email not confirmed
                toast.error('Account found but login failed. Please check your password or use "Forgot Password" to reset.');
                console.error('User exists in profiles with user_id:', profileCheck.user_id, 'Login failed - check password or email confirmation');
              } else {
                // Profile exists but no user_id - user needs to re-register
                toast.error('Account exists but authentication is missing. Please register again or contact support.');
                console.error('User exists in profiles but no user_id - needs re-registration');
              }
            } else {
              toast.error('Invalid email or password. Please check your credentials or register a new account.');
            }
          }
        } else if (error.message.includes('Too many requests')) {
          toast.error('Too many login attempts. Please wait a moment and try again.');
        } else {
          toast.error(error.message || 'Login failed. Please try again.');
        }
        return false;
      }

      if (!data.user) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        toast.error('Login failed. Please try again.');
        return false;
      }

      // Ensure email is confirmed (auto-confirm if not)
      if (!data.user.email_confirmed_at) {
        try {
          await supabase.rpc('auto_confirm_user_email', { _user_id: data.user.id });
        } catch (confirmError) {
          console.warn('Auto-confirm email warning:', confirmError);
        }
      }

      // Fetch user profile immediately (parallel queries already optimized)
      const user = await fetchUserProfile(data.user.id);

      if (!user) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        console.error('Profile fetch failed for user:', data.user.id);
        console.error('User email:', data.user.email);
        
        // For admin users, try to auto-create profile
        if (data.user.email === 'admin@datamorphosis.in') {
          toast.error('Admin profile not found. Please run the fix script in Supabase SQL Editor.');
        } else {
          toast.error('Profile not found. Please register again or contact support.');
        }
        return false;
      }

      // Handle admin user session storage (for backward compatibility)
      if (user.role === 'admin') {
        // Clear any existing admin sessions
        localStorage.removeItem('datamorphosis_admin_user');
        sessionStorage.removeItem('datamorphosis_admin_user');

        // Store admin user in session storage for backward compatibility
        if (credentials.rememberMe) {
          localStorage.setItem('datamorphosis_admin_user', JSON.stringify(user));
        } else {
          sessionStorage.setItem('datamorphosis_admin_user', JSON.stringify(user));
        }
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
      console.error('Error stack:', error.stack);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      toast.error(error.message || 'Login failed. Please try again.');
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      // Validate role
      if (data.role !== 'customer') {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        toast.error('Only customer registration is allowed');
        return false;
      }

      // Step 1: Create auth user (no email verification required)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phone,
          },
          // Email confirmation disabled - users can login immediately
        },
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        console.error('Error details:', {
          message: authError.message,
          status: authError.status,
          name: authError.name,
        });
        setAuthState(prev => ({ ...prev, isLoading: false }));
        
        // Handle specific error cases
        if (authError.message.includes('already registered') || 
            authError.message.includes('already exists') ||
            authError.message.includes('User already registered')) {
          toast.error('Email already registered. Please sign in instead.');
        } else if (authError.message.includes('Password')) {
          toast.error('Password does not meet requirements. Please use at least 8 characters.');
        } else if (authError.message.includes('Invalid email')) {
          toast.error('Please enter a valid email address.');
        } else if (authError.status === 400) {
          toast.error(`Registration failed: ${authError.message || 'Invalid request. Please check your information.'}`);
        } else {
          toast.error(authError.message || 'Registration failed. Please try again.');
        }
        return false;
      }

      if (!authData.user) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        toast.error('Failed to create user account');
        return false;
      }

      // Step 1.5: Auto-confirm email to enable immediate login (no email verification)
      // Auto-confirm email so users can login immediately without email verification
      // The trigger should handle this, but we ensure it's confirmed
      try {
        await supabase.rpc('auto_confirm_user_email', { _user_id: authData.user.id });
      } catch (confirmError) {
        // Non-critical - email confirmation might be handled by Supabase settings or trigger
        console.warn('Auto-confirm email warning (non-critical):', confirmError);
      }

      // Step 2: Create/update profile and role in parallel (trigger may have created them)
      // Company creation is optional - using null for company_id since we only need two tables
      // This is much faster than sequential operations
      const [profileResult, roleResult] = await Promise.all([
        supabase.rpc('create_profile_for_registration', {
          _user_id: authData.user.id,
          _email: data.email.trim(),
          _full_name: data.fullName,
          _phone: data.phone,
          _company_id: null, // No company required - only two tables needed
        }).then(result => {
          // If function fails, try direct update (non-blocking)
          if (result.error) {
            return supabase
              .from('profiles')
              .upsert({
                user_id: authData.user.id,
                email: data.email.trim(),
                full_name: data.fullName,
                phone: data.phone,
                company_id: null,
                is_approved: true,
              }, {
                onConflict: 'user_id'
              });
          }
          return result;
        }),
        supabase.rpc('create_user_role_for_registration', {
          _user_id: authData.user.id,
          _role: 'customer',
        }).then(result => {
          // If function fails, try direct insert (non-blocking, ignore duplicates)
          if (result.error) {
            return supabase
              .from('user_roles')
              .insert({
                user_id: authData.user.id,
                role: 'customer',
              })
              .then(r => {
                // Ignore duplicate errors
                if (r.error && r.error.code !== '23505') {
                  return r;
                }
                return { data: null, error: null };
              });
          }
          return result;
        })
      ]);

      // Log errors but don't block registration (trigger may have already created these)
      if (profileResult.error) {
        console.warn('Profile update warning (non-critical):', profileResult.error);
      }
      if (roleResult.error) {
        console.warn('Role creation warning (non-critical):', roleResult.error);
      }

      // Step 5: Sign in automatically
      console.log('Signing in user after registration');
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email.trim(),
        password: data.password,
      });

      if (signInError) {
        console.error('Auto sign-in error:', signInError);
        // Try to auto-confirm email again and retry login
        if (signInError.message.includes('Email not confirmed') || signInError.message.includes('email_not_confirmed')) {
          try {
            await supabase.rpc('auto_confirm_user_email', { _user_id: authData.user.id });
            // Retry sign in
            const { error: retryError } = await supabase.auth.signInWithPassword({
              email: data.email.trim(),
              password: data.password,
            });
            if (!retryError) {
              // Success - continue with profile fetch
            } else {
              setAuthState(prev => ({ ...prev, isLoading: false }));
              toast.success('Registration successful! Please sign in.');
              return true;
            }
          } catch (retryErr) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
            toast.success('Registration successful! Please sign in.');
            return true;
          }
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
          toast.success('Registration successful! Please sign in.');
          return true;
        }
      }

      // Step 6: Fetch user profile immediately (no delay needed - trigger creates it instantly)
      // Fetch in parallel with setting up state for faster response
      const user = await fetchUserProfile(authData.user.id);

      if (user) {
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        toast.success('Registration successful! Welcome to Datamorphosis.');
        return true;
      }

      // If profile not immediately available, try once more (trigger might be processing)
      // But don't wait - return success immediately for better UX
      const retryUser = await fetchUserProfile(authData.user.id);
      if (retryUser) {
        setAuthState({
          user: retryUser,
          isAuthenticated: true,
          isLoading: false,
        });
        toast.success('Registration successful! Welcome to Datamorphosis.');
        return true;
      }

      // Profile will be available soon via trigger - return success immediately
      // User can refresh or profile will be available on next page load
      setAuthState(prev => ({ ...prev, isLoading: false }));
      toast.success('Registration successful! Redirecting...');
      // Still return true - registration succeeded
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      toast.error(error.message || 'Registration failed. Please try again.');
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('datamorphosis_admin_user');
    sessionStorage.removeItem('datamorphosis_admin_user');
    
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
