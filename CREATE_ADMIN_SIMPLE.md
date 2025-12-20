# Create Admin User - Simple Guide

## Option 1: Via Supabase Dashboard (Easiest - 2 minutes)

### Step-by-Step:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: **MLPROJECT**

2. **Create User**
   - Click **"Authentication"** in left sidebar
   - Click **"Users"** tab
   - Click **"Add User"** button (top right)

3. **Fill Form**
   ```
   Email: admin@datamorphosis.in
   Password: password123
   ✅ Auto Confirm User: CHECK THIS BOX
   ❌ Send Invite Email: Leave unchecked
   ```

4. **Click "Create User"**

5. **Set Admin Role** - Run this SQL in **SQL Editor**:
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
           
           -- Create profile
           INSERT INTO public.profiles (user_id, email, full_name, is_approved)
           VALUES (admin_user_id, 'admin@datamorphosis.in', 'Admin User', true)
           ON CONFLICT (user_id) DO UPDATE 
           SET email = 'admin@datamorphosis.in', full_name = 'Admin User', is_approved = true;
           
           -- Confirm email
           UPDATE auth.users SET email_confirmed_at = NOW() WHERE id = admin_user_id;
           
           RAISE NOTICE '✅ Admin user configured!';
       END IF;
   END $$;
   ```

6. **Done!** Try logging in with:
   - Email: `admin@datamorphosis.in`
   - Password: `password123`

---

## Option 2: Via Script (Automated)

### Prerequisites:
- Node.js installed
- Supabase Service Role Key

### Steps:

1. **Get Service Role Key**
   - Supabase Dashboard → Settings → API
   - Copy the **"service_role"** key (NOT anon key)

2. **Create `.env` file** in project root:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **Run script**:
   ```bash
   node create-admin-user.js
   ```

4. **Done!** Admin user created automatically.

---

## Option 3: Copy-Paste SQL (If user already exists)

If you already created the user but need to set the role:

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy and paste this entire block:

```sql
-- Create admin user setup
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Find admin user
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'admin@datamorphosis.in';
    
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Admin user not found. Please create it first in Authentication > Users';
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
    
    RAISE NOTICE '✅ Admin user configured successfully!';
    RAISE NOTICE 'Email: admin@datamorphosis.in';
    RAISE NOTICE 'Password: password123';
END $$;
```

3. Click **"Run"**
4. Done!

---

## Verification

After creating, verify:

1. **Authentication > Users**: See `admin@datamorphosis.in`
2. **Table Editor > user_roles**: See role = 'admin'
3. **Table Editor > profiles**: See admin profile
4. **Try login**: Should work!

---

## Troubleshooting

### "User already exists" error
- User exists but may not have admin role
- Run Option 3 SQL script to fix

### "Invalid email or password" after creating
- Make sure "Auto Confirm User" was checked
- Verify password is exactly: `password123`
- Check email is exactly: `admin@datamorphosis.in`

### Still not working?
- Check browser console (F12) for errors
- Verify email confirmation is disabled in Auth Settings
- Make sure you ran the SQL script to set admin role

