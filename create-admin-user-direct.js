/**
 * DIRECT Admin User Creation Script
 * 
 * This script creates the admin user using Supabase Admin API
 * 
 * Usage:
 * 1. Get Service Role Key: Supabase Dashboard > Settings > API > service_role key
 * 2. Run: node create-admin-user-direct.js
 * 
 * Or set environment variables:
 * SUPABASE_URL=https://dhodbueeczplfojwkhtr.supabase.co SUPABASE_SERVICE_ROLE_KEY=your_key node create-admin-user-direct.js
 */

import { createClient } from '@supabase/supabase-js';

// Get from environment or prompt
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://dhodbueeczplfojwkhtr.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('\n❌ SUPABASE_SERVICE_ROLE_KEY is required!\n');
  console.log('To get your Service Role Key:');
  console.log('1. Go to: https://supabase.com/dashboard');
  console.log('2. Select project: MLPROJECT');
  console.log('3. Go to: Settings > API');
  console.log('4. Copy the "service_role" key (NOT the anon key)\n');
  console.log('Then run:');
  console.log('  SUPABASE_SERVICE_ROLE_KEY=your_key_here node create-admin-user-direct.js\n');
  process.exit(1);
}

console.log('🔧 Creating admin user...\n');
console.log(`📍 URL: ${SUPABASE_URL}\n`);

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  const email = 'admin@datamorphosis.in';
  const password = 'password123';
  
  try {
    // Check if user exists
    console.log('Checking if admin user exists...');
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`);
    }
    
    const existingUser = users?.find(u => u.email === email);
    let userId;
    
    if (existingUser) {
      console.log('⚠️  User exists. Updating password and confirming email...');
      userId = existingUser.id;
      
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: password,
        email_confirm: true,
        user_metadata: { full_name: 'Admin User' }
      });
      
      if (updateError) {
        throw new Error(`Update failed: ${updateError.message}`);
      }
      console.log('✅ User updated\n');
    } else {
      console.log('Creating new admin user...');
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { full_name: 'Admin User' }
      });
      
      if (error) {
        throw new Error(`Creation failed: ${error.message}`);
      }
      
      if (!data.user) {
        throw new Error('User creation returned no user');
      }
      
      userId = data.user.id;
      console.log('✅ User created\n');
    }
    
    // Set admin role
    console.log('Setting admin role...');
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id' });
    
    if (roleError) {
      console.warn('⚠️  Role error:', roleError.message);
    } else {
      console.log('✅ Admin role set\n');
    }
    
    // Create profile
    console.log('Creating profile...');
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        user_id: userId,
        email: email,
        full_name: 'Admin User',
        is_approved: true
      }, { onConflict: 'user_id' });
    
    if (profileError) {
      console.warn('⚠️  Profile error:', profileError.message);
    } else {
      console.log('✅ Profile created\n');
    }
    
    console.log('='.repeat(50));
    console.log('🎉 SUCCESS! Admin user is ready!');
    console.log('='.repeat(50));
    console.log('\nLogin credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\nYou can now login to your app!\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n📝 Alternative: Create manually in Supabase Dashboard');
    console.log('   See CREATE_ADMIN_NOW.md for instructions\n');
    process.exit(1);
  }
}

createAdmin();

