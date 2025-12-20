/**
 * Simple script to create admin user
 * 
 * Usage:
 * SUPABASE_URL=https://your-project.supabase.co SUPABASE_SERVICE_ROLE_KEY=your_key node create-admin-user-simple.js
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables!');
  console.log('\nUsage:');
  console.log('SUPABASE_URL=https://your-project.supabase.co SUPABASE_SERVICE_ROLE_KEY=your_key node create-admin-user-simple.js');
  console.log('\nTo get Service Role Key:');
  console.log('1. Go to Supabase Dashboard > Settings > API');
  console.log('2. Copy the "service_role" key');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  console.log('🔧 Creating admin user...\n');
  
  try {
    // Check if user exists
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = users?.find(u => u.email === 'admin@datamorphosis.in');
    
    let userId;
    
    if (existingUser) {
      console.log('⚠️  User exists. Updating...');
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        email_confirm: true,
        password: 'password123',
        user_metadata: { full_name: 'Admin User' }
      });
      if (error) throw error;
      userId = existingUser.id;
      console.log('✅ User updated');
    } else {
      console.log('Creating new user...');
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: 'admin@datamorphosis.in',
        password: 'password123',
        email_confirm: true,
        user_metadata: { full_name: 'Admin User' }
      });
      if (error) throw error;
      userId = data.user.id;
      console.log('✅ User created');
    }
    
    // Set admin role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id' });
    
    if (roleError) console.warn('⚠️  Role error:', roleError.message);
    else console.log('✅ Admin role set');
    
    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        user_id: userId,
        email: 'admin@datamorphosis.in',
        full_name: 'Admin User',
        is_approved: true
      }, { onConflict: 'user_id' });
    
    if (profileError) console.warn('⚠️  Profile error:', profileError.message);
    else console.log('✅ Profile created');
    
    console.log('\n🎉 Admin user ready!');
    console.log('Email: admin@datamorphosis.in');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n📝 Alternative: Create manually in Supabase Dashboard');
    console.log('   See CREATE_ADMIN_SIMPLE.md');
    process.exit(1);
  }
}

main();

