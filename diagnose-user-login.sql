-- Diagnostic SQL: Check why a user can't login
-- Replace 'user@example.com' with the actual email

-- Check if user exists in auth.users
SELECT 
    'auth.users' as table_name,
    id,
    email,
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN '❌ Email not confirmed'
        ELSE '✅ Email confirmed'
    END as status
FROM auth.users
WHERE email = 'user@example.com'; -- REPLACE WITH ACTUAL EMAIL

-- Check if user exists in profiles
SELECT 
    'profiles' as table_name,
    id,
    user_id,
    email,
    full_name,
    is_approved,
    created_at,
    CASE 
        WHEN user_id IS NULL THEN '❌ No user_id'
        ELSE '✅ Has user_id'
    END as status
FROM public.profiles
WHERE email = 'user@example.com'; -- REPLACE WITH ACTUAL EMAIL

-- Check if user has role
SELECT 
    'user_roles' as table_name,
    id,
    user_id,
    role,
    created_at,
    CASE 
        WHEN role IS NULL THEN '❌ No role'
        ELSE '✅ Has role: ' || role
    END as status
FROM public.user_roles
WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'user@example.com' -- REPLACE WITH ACTUAL EMAIL
    UNION
    SELECT user_id FROM public.profiles WHERE email = 'user@example.com' -- REPLACE WITH ACTUAL EMAIL
);

-- Complete user status check
SELECT 
    COALESCE(u.email, p.email) as email,
    CASE 
        WHEN u.id IS NULL THEN '❌ NOT IN auth.users'
        WHEN u.email_confirmed_at IS NULL THEN '❌ Email not confirmed'
        WHEN p.id IS NULL THEN '⚠️  No profile'
        WHEN ur.role IS NULL THEN '⚠️  No role'
        ELSE '✅ Ready to login'
    END as login_status,
    u.id as auth_user_id,
    u.email_confirmed_at IS NOT NULL as email_confirmed,
    p.id as profile_id,
    ur.role,
    p.is_approved
FROM auth.users u
FULL OUTER JOIN public.profiles p ON u.id = p.user_id OR u.email = p.email
LEFT JOIN public.user_roles ur ON COALESCE(u.id, p.user_id) = ur.user_id
WHERE COALESCE(u.email, p.email) = 'user@example.com'; -- REPLACE WITH ACTUAL EMAIL

