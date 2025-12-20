# 🔧 Fix Customer Login Issue

## Problem
Customers exist in database (profiles table) but can't login with "Invalid email or password" error.

## Root Causes

1. **User exists in `profiles` but not in `auth.users`** - Profile was created but auth user wasn't
2. **Email not confirmed** - User exists but email_confirmed_at is NULL
3. **Wrong password** - Password doesn't match
4. **User missing from auth.users** - Profile exists but no auth credentials

## ✅ Solution: Run Migration

### Step 1: Run Migration to Fix Existing Users

Run this migration to auto-confirm all users and fix missing data:

```bash
supabase db push
```

This will run migration `008_fix_existing_customers.sql` which:
- ✅ Auto-confirms all unconfirmed emails
- ✅ Creates missing profiles for auth.users
- ✅ Creates missing roles for users
- ✅ Shows status of all users

### Step 2: Check Migration Results

After running, check the output. It will show:
- How many users were fixed
- If any profiles exist without auth.users (these need re-registration)
- Status of each user

### Step 3: For Users Still Can't Login

If users still can't login after migration:

#### Option A: User Needs to Reset Password

1. Go to login page
2. Click "Forgot password"
3. Enter email
4. Reset password
5. Try login again

#### Option B: User Needs to Re-register

If profile exists but auth.users doesn't:
1. User needs to register again with same email
2. Or delete profile and re-register

#### Option C: Manual Fix via SQL

Run this SQL in Supabase SQL Editor to check specific user:

```sql
-- Check user status
SELECT 
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmed,
    u.created_at,
    ur.role,
    p.full_name,
    p.is_approved,
    CASE 
        WHEN u.id IS NULL THEN '❌ No auth.users entry'
        WHEN u.email_confirmed_at IS NULL THEN '❌ Email not confirmed'
        WHEN ur.role IS NULL THEN '⚠️  Role missing'
        WHEN p.id IS NULL THEN '⚠️  Profile missing'
        ELSE '✅ Ready to login'
    END as status
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE u.email = 'user@example.com'; -- Replace with actual email
```

## 🔍 Diagnostic Queries

### Check All Users Status

```sql
SELECT 
    u.email,
    u.email_confirmed_at IS NOT NULL as confirmed,
    ur.role,
    p.full_name,
    CASE 
        WHEN u.email_confirmed_at IS NULL THEN 'Email not confirmed'
        WHEN ur.role IS NULL THEN 'Role missing'
        WHEN p.id IS NULL THEN 'Profile missing'
        ELSE 'OK'
    END as issue
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE u.email != 'admin@datamorphosis.in'
ORDER BY u.created_at DESC;
```

### Find Orphaned Profiles (profiles without auth.users)

```sql
SELECT p.email, p.full_name, p.created_at
FROM public.profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = p.user_id
);
```

### Find Users Without Profiles

```sql
SELECT u.email, u.created_at
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
)
AND u.email != 'admin@datamorphosis.in';
```

## 🛠️ Manual Fixes

### Fix Specific User's Email Confirmation

```sql
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'user@example.com' -- Replace with actual email
AND email_confirmed_at IS NULL;
```

### Create Missing Profile for User

```sql
INSERT INTO public.profiles (user_id, email, full_name, is_approved)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', 'User'),
    true
FROM auth.users u
WHERE u.email = 'user@example.com' -- Replace with actual email
AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
);
```

### Create Missing Role for User

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'customer'
FROM auth.users u
WHERE u.email = 'user@example.com' -- Replace with actual email
AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = u.id
);
```

## ✅ Verification

After running migration, verify:

1. **All users have email_confirmed_at set**
2. **All users have profiles**
3. **All users have roles**
4. **Try login** - Should work!

## 📝 Prevention

The trigger function `handle_new_user()` should automatically:
- ✅ Create profile on signup
- ✅ Set customer role
- ✅ Auto-confirm email

If users still have issues, check:
- Supabase Auth Settings → Email confirmations should be DISABLED
- Trigger function is working correctly
- Migration 008 was applied

