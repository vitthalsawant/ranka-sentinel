# Quick Fix: Admin Login Issue

## Problem
Getting "Invalid email or password" when trying to login with admin credentials.

## Root Cause
The admin user doesn't exist in Supabase Auth database.

## Quick Fix (5 minutes)

### Step 1: Create Admin User in Supabase Dashboard

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select project: **MLPROJECT**

2. **Create User**
   - Click: **Authentication** → **Users**
   - Click: **"Add User"** button
   - Fill in:
     ```
     Email: admin@datamorphosis.in
     Password: password123
     ✅ Auto Confirm User: CHECKED (Very Important!)
     ```
   - Click: **"Create User"**

### Step 2: Set Admin Role

1. **Go to SQL Editor** in Supabase Dashboard
2. **Run this SQL**:

```sql
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'admin@datamorphosis.in';
    
    IF admin_user_id IS NOT NULL THEN
        -- Set admin role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (admin_user_id, 'admin')
        ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
        
        -- Create/update profile
        INSERT INTO public.profiles (user_id, email, full_name, is_approved)
        VALUES (admin_user_id, 'admin@datamorphosis.in', 'Admin User', true)
        ON CONFLICT (user_id) DO UPDATE 
        SET 
            email = 'admin@datamorphosis.in',
            full_name = 'Admin User',
            is_approved = true;
        
        -- Confirm email
        UPDATE auth.users
        SET email_confirmed_at = NOW()
        WHERE id = admin_user_id;
        
        RAISE NOTICE '✅ Admin user configured successfully!';
    ELSE
        RAISE NOTICE '❌ Admin user not found. Please create it first.';
    END IF;
END $$;
```

### Step 3: Test Login

1. Go to your app login page
2. Enter:
   - Email: `admin@datamorphosis.in`
   - Password: `password123`
3. Click "Sign In"
4. Should redirect to `/admin` dashboard ✅

## Verification

After creating, verify in Supabase Dashboard:

1. **Authentication > Users**: Should see `admin@datamorphosis.in`
2. **Table Editor > user_roles**: Should see role = 'admin'
3. **Table Editor > profiles**: Should see admin profile

## Still Not Working?

- Check browser console (F12) for detailed errors
- Verify email is exactly: `admin@datamorphosis.in` (no spaces, correct case)
- Verify password is exactly: `password123` (no spaces)
- Make sure "Auto Confirm User" was checked when creating
- Check that email confirmation is disabled in Auth Settings

## Alternative: Use Migration

After creating the user, you can also run:
```bash
supabase db push
```

This will run migration 006 which auto-configures the admin user.

