# Create Admin User - Step by Step Guide

## Problem
The admin user doesn't exist in Supabase Auth, which is why login is failing with "Invalid email or password".

## Solution: Create Admin User in Supabase Dashboard

### Method 1: Via Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**
   - Open: https://supabase.com/dashboard
   - Select your project: **MLPROJECT**

2. **Navigate to Authentication**
   - Click on **Authentication** in the left sidebar
   - Click on **Users** tab

3. **Add New User**
   - Click the **"Add User"** button (or **"Invite User"**)
   - Fill in the form:
     - **Email**: `admin@datamorphosis.in`
     - **Password**: `password123`
     - **Auto Confirm User**: ✅ **CHECK THIS BOX** (Very Important!)
     - **Send Invite Email**: ❌ Uncheck (optional)
   - Click **"Create User"**

4. **Set Admin Role**
   - After creating the user, run this SQL in **SQL Editor**:
   ```sql
   -- Run migration 002_create_admin_user.sql
   -- Or run this directly:
   DO $$
   DECLARE
       admin_user_id UUID;
   BEGIN
       SELECT id INTO admin_user_id
       FROM auth.users
       WHERE email = 'admin@datamorphosis.in';
       
       IF admin_user_id IS NOT NULL THEN
           INSERT INTO public.user_roles (user_id, role)
           VALUES (admin_user_id, 'admin')
           ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
           
           INSERT INTO public.profiles (user_id, email, full_name, is_approved)
           VALUES (admin_user_id, 'admin@datamorphosis.in', 'Admin User', true)
           ON CONFLICT (user_id) DO UPDATE 
           SET 
               email = 'admin@datamorphosis.in',
               full_name = 'Admin User',
               is_approved = true;
           
           UPDATE auth.users
           SET email_confirmed_at = NOW()
           WHERE id = admin_user_id;
           
           RAISE NOTICE 'Admin user configured successfully!';
       END IF;
   END $$;
   ```

5. **Test Login**
   - Go to your app login page
   - Email: `admin@datamorphosis.in`
   - Password: `password123`
   - Should redirect to `/admin` dashboard

### Method 2: Via Supabase CLI (Alternative)

If you have Supabase Admin API access, you can use the CLI:

```bash
# This requires admin API key
supabase auth admin create-user \
  --email admin@datamorphosis.in \
  --password password123 \
  --email-confirm true
```

Then run migration 002 to set the admin role.

## Verification

After creating the user, verify it exists:

1. **Check in Supabase Dashboard**:
   - Authentication > Users
   - Should see `admin@datamorphosis.in`

2. **Check in Database**:
   - Table Editor > `user_roles`
   - Should see role = 'admin' for admin@datamorphosis.in

3. **Test Login**:
   - Try logging in with the credentials
   - Should work without errors

## Troubleshooting

### Still getting "Invalid email or password"
- Double-check the email is exactly: `admin@datamorphosis.in` (no typos)
- Verify password is exactly: `password123` (case-sensitive)
- Make sure "Auto Confirm User" was checked when creating
- Check browser console for detailed error messages

### User created but can't login
- Verify email_confirmed_at is set in auth.users table
- Run the SQL script above to ensure role and profile are set
- Check that email confirmation is disabled in Auth Settings

### Profile not found error
- Run migration 002_create_admin_user.sql
- Or run the SQL script in Method 1, Step 4

