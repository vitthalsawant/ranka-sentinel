# 🔧 Fix Admin Login Issue

## Problem
Getting "Invalid login credentials" error because admin user doesn't exist in Supabase Auth.

## ✅ Solution: Create Admin User

### Method 1: Automated Script (Recommended)

1. **Get Service Role Key:**
   - Go to: https://supabase.com/dashboard
   - Select project: **MLPROJECT**
   - Go to: **Settings** → **API**
   - Copy the **"service_role"** key (NOT anon key)

2. **Run the script:**
   ```bash
   SUPABASE_URL=https://dhodbueeczplfojwkhtr.supabase.co \
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here \
   node scripts/create-admin.js
   ```

   **OR** create a `.env` file in project root:
   ```env
   VITE_SUPABASE_URL=https://dhodbueeczplfojwkhtr.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
   Then run: `node scripts/create-admin.js`

3. **Done!** Try logging in:
   - Email: `admin@datamorphosis.in`
   - Password: `password123`

---

### Method 2: Manual (Via Dashboard)

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Select project: **MLPROJECT**

2. **Create User:**
   - Click: **Authentication** → **Users**
   - Click: **"Add User"** button
   - Fill in:
     ```
     Email: admin@datamorphosis.in
     Password: password123
     ✅ Auto Confirm User: CHECK THIS BOX
     ```
   - Click: **"Create User"**

3. **Set Admin Role** - Run this SQL in **SQL Editor**:
   ```sql
   DO $$
   DECLARE
       admin_user_id UUID;
   BEGIN
       SELECT id INTO admin_user_id
       FROM auth.users
       WHERE email = 'admin@datamorphosis.in';
       
       IF admin_user_id IS NULL THEN
           RAISE EXCEPTION 'Admin user not found. Create it first!';
       END IF;
       
       INSERT INTO public.user_roles (user_id, role)
       VALUES (admin_user_id, 'admin')
       ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
       
       INSERT INTO public.profiles (user_id, email, full_name, is_approved)
       VALUES (admin_user_id, 'admin@datamorphosis.in', 'Admin User', true)
       ON CONFLICT (user_id) DO UPDATE 
       SET email = 'admin@datamorphosis.in', full_name = 'Admin User', is_approved = true;
       
       UPDATE auth.users SET email_confirmed_at = NOW() WHERE id = admin_user_id;
       
       RAISE NOTICE '✅ Admin configured!';
   END $$;
   ```

4. **Done!** Login should work now.

---

## 🔍 Verification

After creating, verify:

1. **Authentication > Users**: Should see `admin@datamorphosis.in` ✅
2. **Table Editor > user_roles**: Should see `role = 'admin'` ✅
3. **Try login**: Should work! ✅

---

## 🐛 Still Getting Errors?

### "Invalid login credentials"
- ✅ Make sure user was created in Authentication > Users
- ✅ Verify password is exactly: `password123` (no spaces)
- ✅ Verify email is exactly: `admin@datamorphosis.in` (lowercase)
- ✅ Make sure "Auto Confirm User" was checked

### "Admin user not found" in SQL
- Create user first in Authentication > Users
- Then run the SQL script

### Check Browser Console
- Open DevTools (F12)
- Check Console tab for detailed errors
- Check Network tab to see API responses

---

## 📝 Quick Reference

**Admin Credentials:**
- Email: `admin@datamorphosis.in`
- Password: `password123`
- Role: `admin`

**Your Supabase Project:**
- URL: `https://dhodbueeczplfojwkhtr.supabase.co`
- Project Ref: `dhodbueeczplfojwkhtr`

