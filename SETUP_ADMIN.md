# 🚀 Quick Setup: Create Admin User

## ⚡ Fastest Method (Copy-Paste SQL)

1. **Go to Supabase Dashboard** → Your Project → **SQL Editor**

2. **Copy and paste this entire SQL block:**

```sql
-- Create admin user if it doesn't exist, or update if it does
DO $$
DECLARE
    admin_user_id UUID;
    user_exists BOOLEAN;
BEGIN
    -- Check if user exists
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'admin@datamorphosis.in';
    
    user_exists := admin_user_id IS NOT NULL;
    
    IF NOT user_exists THEN
        RAISE NOTICE '========================================';
        RAISE NOTICE '❌ Admin user NOT FOUND!';
        RAISE NOTICE '========================================';
        RAISE NOTICE 'Please create the user first:';
        RAISE NOTICE '1. Go to Authentication > Users';
        RAISE NOTICE '2. Click "Add User"';
        RAISE NOTICE '3. Email: admin@datamorphosis.in';
        RAISE NOTICE '4. Password: password123';
        RAISE NOTICE '5. ✅ CHECK "Auto Confirm User"';
        RAISE NOTICE '6. Click "Create User"';
        RAISE NOTICE '7. Then run this SQL again';
        RAISE NOTICE '========================================';
        RETURN;
    END IF;
    
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
    SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
    WHERE id = admin_user_id;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Admin user configured successfully!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Login credentials:';
    RAISE NOTICE 'Email: admin@datamorphosis.in';
    RAISE NOTICE 'Password: password123';
    RAISE NOTICE '========================================';
END $$;
```

3. **Click "Run"**

4. **If you see "Admin user NOT FOUND":**
   - Follow the instructions shown
   - Create user in Authentication > Users
   - Then run the SQL again

5. **Done!** Login with:
   - Email: `admin@datamorphosis.in`
   - Password: `password123`

---

## 📋 Manual Method (Step-by-Step)

### Step 1: Create User in Dashboard

1. **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add User"**
3. Fill in:
   ```
   Email: admin@datamorphosis.in
   Password: password123
   ✅ Auto Confirm User: CHECKED
   ```
4. Click **"Create User"**

### Step 2: Set Admin Role

Run the SQL above in **SQL Editor**.

---

## 🤖 Automated Method (Using Script)

### Prerequisites:
- Node.js installed
- Service Role Key from Supabase

### Steps:

1. **Get Service Role Key:**
   - Dashboard → Settings → API
   - Copy **"service_role"** key

2. **Run script:**
   ```bash
   SUPABASE_URL=https://your-project.supabase.co \
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key \
   node create-admin-user-simple.js
   ```

   Or set in `.env` file:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
   Then: `node create-admin-user-simple.js`

---

## ✅ Verification

After setup, verify:

1. **Authentication > Users**: See `admin@datamorphosis.in` ✅
2. **Table Editor > user_roles**: See `role = 'admin'` ✅  
3. **Try login**: Should work! ✅

---

## 🐛 Troubleshooting

### "Invalid email or password"
- ✅ Check "Auto Confirm User" was checked
- ✅ Verify password: `password123` (exact, no spaces)
- ✅ Verify email: `admin@datamorphosis.in` (exact, lowercase)

### "Admin user NOT FOUND" in SQL
- Create user first in Authentication > Users
- Then run SQL again

### Still not working?
- Check browser console (F12) for errors
- Verify email confirmation disabled in Auth Settings
- Make sure SQL script ran successfully

