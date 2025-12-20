# 🚀 Create Admin User - RIGHT NOW

## ⚡ FASTEST METHOD (2 Minutes)

### Step 1: Create User in Dashboard

1. **Open:** https://supabase.com/dashboard
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

### Step 2: Run This SQL

1. **In Supabase Dashboard:** Go to **SQL Editor**
2. **Copy this entire SQL block:**

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
    
    -- Set admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
    
    -- Create profile
    INSERT INTO public.profiles (user_id, email, full_name, is_approved)
    VALUES (admin_user_id, 'admin@datamorphosis.in', 'Admin User', true)
    ON CONFLICT (user_id) DO UPDATE 
    SET email = 'admin@datamorphosis.in', full_name = 'Admin User', is_approved = true;
    
    -- Confirm email
    UPDATE auth.users SET email_confirmed_at = NOW() WHERE id = admin_user_id;
    
    RAISE NOTICE '✅ Admin configured!';
END $$;
```

3. **Click:** "Run"
4. **Done!**

### Step 3: Test Login

- **Email:** `admin@datamorphosis.in`
- **Password:** `password123`
- **Should redirect to:** `/admin` dashboard

---

## 🔄 Or Use Migration

After creating the user, run:

```bash
supabase db push
```

This will run migration `007_fix_admin_user_complete.sql` which auto-configures everything.

---

## ✅ Verification

After setup, check:

1. **Authentication > Users:** See `admin@datamorphosis.in` ✅
2. **Table Editor > user_roles:** See `role = 'admin'` ✅
3. **Table Editor > profiles:** See admin profile ✅
4. **Try login:** Should work! ✅

---

## 🐛 Troubleshooting

### Still getting "Invalid login credentials"?

1. ✅ Verify user exists: Authentication > Users
2. ✅ Check password is exactly: `password123` (no spaces)
3. ✅ Check email is exactly: `admin@datamorphosis.in` (lowercase)
4. ✅ Make sure "Auto Confirm User" was checked
5. ✅ Run the SQL script above to set role and confirm email

### "Admin user not found" in SQL?

- Create user first in Authentication > Users
- Then run the SQL script

---

## 📝 Quick Reference

**Admin Credentials:**
- Email: `admin@datamorphosis.in`
- Password: `password123`

**Your Project:**
- URL: `https://dhodbueeczplfojwkhtr.supabase.co`
- Project: MLPROJECT

