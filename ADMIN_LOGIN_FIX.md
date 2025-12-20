# 🔧 Fix Admin Login - Complete Guide

## ❌ Current Error
```
Invalid login credentials
Admin user does not exist
```

## ✅ Solution: Create Admin User

You have **2 options**:

---

## Option 1: Automated Script (Fastest - 2 minutes)

### Step 1: Get Service Role Key

1. Go to: **https://supabase.com/dashboard**
2. Select project: **MLPROJECT**
3. Go to: **Settings** → **API**
4. Copy the **"service_role"** key (NOT the anon/public key)
   - It's a long string starting with `eyJ...`
   - Keep it secret! Don't commit it to git

### Step 2: Run Script

**Windows PowerShell:**
```powershell
$env:SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"
node create-admin-user-direct.js
```

**Or create `.env` file** (recommended):
```env
SUPABASE_URL=https://dhodbueeczplfojwkhtr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Then run:
```bash
node create-admin-user-direct.js
```

### Step 3: Test Login

- Email: `admin@datamorphosis.in`
- Password: `password123`
- Should work! ✅

---

## Option 2: Manual Method (No Scripts Needed)

### Step 1: Create User in Dashboard

1. **Go to:** https://supabase.com/dashboard
2. **Select:** MLPROJECT project
3. **Click:** Authentication → Users
4. **Click:** "Add User" button
5. **Fill in:**
   ```
   Email: admin@datamorphosis.in
   Password: password123
   ✅ Auto Confirm User: CHECK THIS BOX
   ```
6. **Click:** "Create User"

### Step 2: Set Admin Role (SQL Editor)

1. **In Supabase Dashboard:** Go to **SQL Editor**
2. **Copy and paste this SQL:**

```sql
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'admin@datamorphosis.in';
    
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Admin user not found! Create it first in Authentication > Users';
    END IF;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
    
    INSERT INTO public.profiles (user_id, email, full_name, is_approved)
    VALUES (admin_user_id, 'admin@datamorphosis.in', 'Admin User', true)
    ON CONFLICT (user_id) DO UPDATE 
    SET email = 'admin@datamorphosis.in', full_name = 'Admin User', is_approved = true;
    
    UPDATE auth.users SET email_confirmed_at = NOW() WHERE id = admin_user_id;
    
    RAISE NOTICE '✅ Admin configured successfully!';
END $$;
```

3. **Click:** "Run"
4. **Done!**

### Step 3: Test Login

- Email: `admin@datamorphosis.in`
- Password: `password123`

---

## ✅ Verification Checklist

After creating admin user, verify:

- [ ] **Authentication > Users:** See `admin@datamorphosis.in`
- [ ] **Table Editor > user_roles:** See `role = 'admin'`
- [ ] **Table Editor > profiles:** See admin profile
- [ ] **Try login:** Works without errors

---

## 🐛 Still Not Working?

### "Invalid login credentials"
- ✅ User exists in Authentication > Users?
- ✅ Password is exactly: `password123` (no spaces, lowercase)
- ✅ Email is exactly: `admin@datamorphosis.in` (lowercase)
- ✅ "Auto Confirm User" was checked when creating?

### Check Browser Console
- Open DevTools (F12)
- Check Console for detailed errors
- Check Network tab → Look at the `/auth/v1/token` request
- See what error Supabase returns

### Verify in Supabase Dashboard
1. **Authentication > Users:** User should exist
2. **SQL Editor:** Run this to check:
   ```sql
   SELECT 
       u.email,
       u.email_confirmed_at IS NOT NULL as confirmed,
       ur.role,
       p.full_name
   FROM auth.users u
   LEFT JOIN public.user_roles ur ON u.id = ur.user_id
   LEFT JOIN public.profiles p ON u.id = p.user_id
   WHERE u.email = 'admin@datamorphosis.in';
   ```

---

## 📝 Quick Reference

**Admin Credentials:**
- Email: `admin@datamorphosis.in`
- Password: `password123`

**Your Project:**
- URL: `https://dhodbueeczplfojwkhtr.supabase.co`
- Project Ref: `dhodbueeczplfojwkhtr`

---

## 🚀 Recommended: Use Option 1 (Script)

The script is fastest and handles everything automatically. Just get your service role key and run it!

