# 🚀 Quick Fix: Customer Login Issue

## Problem
Customers exist in database but get "Invalid email or password" when trying to login.

## ✅ Quick Fix (Run This SQL)

### Step 1: Run This SQL in Supabase SQL Editor

Copy and paste this entire SQL block:

```sql
-- Fix all existing customer users
-- This will auto-confirm emails and ensure all users can login

-- 1. Auto-confirm all unconfirmed users
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 2. Create missing profiles for auth.users
INSERT INTO public.profiles (user_id, email, full_name, is_approved)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', 'User'),
    true
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
)
AND u.email != 'admin@datamorphosis.in'
ON CONFLICT (user_id) DO UPDATE
SET 
    email = EXCLUDED.email,
    is_approved = true;

-- 3. Create missing roles
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'customer'
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = u.id
)
AND u.email != 'admin@datamorphosis.in'
ON CONFLICT (user_id) DO NOTHING;

-- 4. Show status
SELECT 
    u.email,
    u.email_confirmed_at IS NOT NULL as confirmed,
    ur.role,
    p.full_name,
    '✅ Ready' as status
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE u.email != 'admin@datamorphosis.in'
ORDER BY u.created_at DESC;
```

### Step 2: Test Login

Try logging in with customer credentials - should work now!

---

## 🔍 If Still Not Working

### Check Specific User

Run this SQL (replace email):

```sql
SELECT 
    u.email,
    u.email_confirmed_at IS NOT NULL as confirmed,
    ur.role,
    p.full_name,
    CASE 
        WHEN u.id IS NULL THEN '❌ User not in auth.users'
        WHEN u.email_confirmed_at IS NULL THEN '❌ Email not confirmed'
        WHEN ur.role IS NULL THEN '⚠️  No role'
        WHEN p.id IS NULL THEN '⚠️  No profile'
        ELSE '✅ OK'
    END as status
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE u.email = 'customer@example.com'; -- REPLACE WITH ACTUAL EMAIL
```

### Common Issues

1. **User exists in profiles but NOT in auth.users**
   - Solution: User needs to re-register
   - Or: Delete profile and user registers again

2. **Email not confirmed**
   - Solution: Run the SQL above (Step 1)

3. **Wrong password**
   - Solution: Use "Forgot Password" to reset

4. **User missing role**
   - Solution: Run the SQL above (Step 1)

---

## 🛠️ For Users Who Can't Login

### Option 1: Reset Password

1. Go to login page
2. Click "Forgot Password"
3. Enter email
4. Reset password
5. Login with new password

### Option 2: Re-register

1. Delete user's profile (if needed)
2. User registers again with same email
3. Should work now

---

## ✅ Verification

After running SQL, check:

- [ ] All users have `email_confirmed_at` set
- [ ] All users have profiles
- [ ] All users have roles
- [ ] Try login - works!

---

## 📝 What the Migration Did

Migration `008_fix_existing_customers.sql` was applied which:
- ✅ Auto-confirmed all emails
- ✅ Created missing profiles
- ✅ Created missing roles
- ✅ Showed status of all users

If users still can't login, they likely:
- Have wrong password (use reset)
- Exist in profiles but not auth.users (need re-register)
- Have some other data inconsistency

Run the diagnostic SQL above to check specific users!

