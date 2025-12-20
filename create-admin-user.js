/**
 * Script to create admin user via Supabase Admin API
 * 
 * Usage:
 * 1. Get your Supabase Service Role Key from Dashboard > Settings > API
 * 2. Create a .env file with: SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
 * 3. Run: node create-admin-user.js
 * 
 * OR set environment variable directly:
 * SUPABASE_SERVICE_ROLE_KEY=your_key node create-admin-user.js
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('❌ Error: VITE_SUPABASE_URL or SUPABASE_URL not found in environment variables');
  console.log('\nPlease set it in your .env file or environment variables.');
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not found');
  console.log('\nTo get your Service Role Key:');
  console.log('1. Go to Supabase Dashboard');
  console.log('2. Settings > API');
  console.log('3. Copy the "service_role" key (NOT the anon key)');
  console.log('4. Add it to .env file: SUPABASE_SERVICE_ROLE_KEY=your_key_here');
  console.log('\nOR run: SUPABASE_SERVICE_ROLE_KEY=your_key node create-admin-user.js');
  process.exit(1);
}

// Create admin client with service role key
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  console.log('🔧 Creating admin user...\n');
  
  const adminEmail = 'admin@datamorphosis.in';
  const adminPassword = 'password123';
  
  try {
    // Step 1: Create user in auth
    console.log('Step 1: Creating user in Supabase Auth...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: 'Admin User'
      }
    });

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        console.log('⚠️  User already exists. Updating existing user...');
        
        // Get existing user
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) {
          throw listError;
        }
        
        const existingUser = users.find(u => u.email === adminEmail);
        if (!existingUser) {
          throw new Error('User exists but could not be found');
        }
        
        // Update existing user
        const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          {
            email_confirm: true,
            password: adminPassword, // Update password
            user_metadata: {
              full_name: 'Admin User'
            }
          }
        );
        
        if (updateError) {
          throw updateError;
        }
        
        console.log('✅ User updated successfully');
        await setupAdminRole(existingUser.id);
        return;
      }
      throw authError;
    }

    if (!authData.user) {
      throw new Error('User creation failed - no user returned');
    }

    console.log('✅ User created successfully');
    console.log(`   User ID: ${authData.user.id}`);
    console.log(`   Email: ${authData.user.email}`);

    // Step 2: Set admin role and profile
    await setupAdminRole(authData.user.id);

    console.log('\n🎉 Admin user created successfully!');
    console.log('\nLogin credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\nYou can now login to your app!');

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    console.error('\nFull error:', error);
    console.log('\n📝 Alternative: Create user manually in Supabase Dashboard');
    console.log('   See QUICK_FIX_ADMIN_LOGIN.md for manual instructions');
    process.exit(1);
  }
}

async function setupAdminRole(userId) {
  console.log('\nStep 2: Setting up admin role and profile...');
  
  try {
    // Set admin role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'admin'
      }, {
        onConflict: 'user_id'
      });

    if (roleError) {
      console.warn('⚠️  Role setup warning:', roleError.message);
    } else {
      console.log('✅ Admin role set');
    }

    // Create/update profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        user_id: userId,
        email: 'admin@datamorphosis.in',
        full_name: 'Admin User',
        is_approved: true
      }, {
        onConflict: 'user_id'
      });

    if (profileError) {
      console.warn('⚠️  Profile setup warning:', profileError.message);
    } else {
      console.log('✅ Admin profile created');
    }

  } catch (error) {
    console.error('❌ Error setting up admin role:', error.message);
    throw error;
  }
}

// Run the script
createAdminUser();

