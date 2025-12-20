# ⚠️ WARNING: Drop All Database Tables

## ⚠️ CRITICAL WARNING

**This migration will DELETE ALL DATA in your database!**

- ✅ All tables will be dropped
- ✅ All data will be permanently deleted
- ✅ All functions, triggers, and views will be removed
- ❌ **This action is IRREVERSIBLE**

## Before Running

1. **Backup your data** if you need it later
2. **Export important data** from Supabase Dashboard
3. **Confirm** you want to delete everything

## How to Run

### Option 1: Via Supabase CLI

```bash
supabase db push
```

This will apply migration `009_drop_all_tables.sql`

### Option 2: Via Supabase Dashboard

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/009_drop_all_tables.sql`
3. Paste and click "Run"
4. Confirm the warning

## What Gets Dropped

- ✅ All tables (profiles, user_roles, etc.)
- ✅ All functions (handle_new_user, auto_confirm_user_email, etc.)
- ✅ All triggers (on_auth_user_created, etc.)
- ✅ All views
- ✅ All sequences
- ✅ All custom types (enums like app_role)

## What Stays

- ✅ Supabase Auth users (in `auth.users` table)
- ✅ Supabase system tables
- ✅ Database structure itself

## After Dropping

To recreate everything:

```bash
# Run all migrations from scratch
supabase db push
```

This will recreate:
- All tables
- All functions
- All triggers
- All RLS policies

## Alternative: Reset Specific Tables Only

If you only want to clear data (not drop tables):

```sql
-- Clear data but keep structure
TRUNCATE TABLE public.profiles CASCADE;
TRUNCATE TABLE public.user_roles CASCADE;
```

## Backup Before Dropping

To backup your data first:

1. **Supabase Dashboard** → **Table Editor**
2. Export each table as CSV
3. Or use SQL:

```sql
-- Export profiles
COPY public.profiles TO '/tmp/profiles_backup.csv' CSV HEADER;

-- Export user_roles  
COPY public.user_roles TO '/tmp/user_roles_backup.csv' CSV HEADER;
```

---

**⚠️ Proceed with caution!**

