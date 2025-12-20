/**
 * Create Admin User Script
 * 
 * This script creates the admin user in Supabase Auth using the Admin API
 * 
 * Usage:
 * 1. Get your Supabase Service Role Key from Dashboard > Settings > API
 * 2. Run: node scripts/create-admin.js
 * 
 * Or set environment variables:
 * SUPABASE_URL=https://your-project.supabase.co SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/create-admin.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to load .env file if it exists
let envVars = {};
try {
  const envFile = readFileSync(join(__dirname, '..', '.env'), 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
} catch (e) {
  // .env file doesn't exist, use process.env
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || envVars.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('❌ Error: SUPABASE_URL not found');
  console.log('\nPlease set it:');
  console.log('  SUPABASE_URL=https://your-project.supabase.co node scripts/create-admin.js');
  console.log('\nOr add to .env file:');
  console.log('  VITE_SUPABASE_URL=https://your-project.supabase.co');
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not found');
  console.log('\nTo get your Service Role Key:');
  console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard');
  console.log('2. Select your project: MLPROJECT');
  console.log('3. Go to Settings > API');
  console.log('4. Copy the "service_role" key (NOT the anon/public key)');
  console.log('\nThen run:');
  console.log('  SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/create-admin.js');
  console.log('\nOr add to .env file:');
  console.log('  SUPABASE_SERVICE_ROLE_KEY=your_key');
  process.exit(1);
}

console.log('🔧 Creating admin user...\n');
console.log(`📍 Supabase URL: ${SUPABASE_URL}\n`);

// Create admin client with service role key
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  const adminEmail = 'admin@datamorphosis.in';
  const adminPassword = 'password123';
  
  try {
    // Step 1: Check if user already exists
    console.log('Step 1: Checking if admin user exists...');
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`);
    }
    
    const existingUser = users?.find(u => u.email === adminEmail);
    
    let userId;
    
    if (existingUser) {
      console.log('⚠️  Admin user already exists. Updating...');
      userId = existingUser.id;
      
      // Update existing user
      const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          email_confirm: true,
          password: adminPassword,
          user_metadata: {
            full_name: 'Admin User'
          }
        }
      );
      
      if (updateError) {
        throw new Error(`Failed to update user: ${updateError.message}`);
      }
      
      console.log('✅ User updated successfully');
      console.log(`   User ID: ${userId}`);
    } else {
      console.log('Step 2: Creating new admin user...');
      
      // Create new user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: 'Admin User'
        }
      });

      if (authError) {
        throw new Error(`Failed to create user: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('User creation failed - no user returned');
      }

      userId = authData.user.id;
      console.log('✅ User created successfully');
      console.log(`   User ID: ${userId}`);
      console.log(`   Email: ${authData.user.email}`);
    }

    // Step 3: Set admin role
    console.log('\nStep 3: Setting admin role...');
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'admin'
      }, {
        onConflict: 'user_id'
      });

    if (roleError) {
      console.warn('⚠️  Warning setting role:', roleError.message);
      console.log('   This might be okay if role already exists');
    } else {
      console.log('✅ Admin role set');
    }

    // Step 4: Create/update profile
    console.log('\nStep 4: Creating admin profile...');
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        user_id: userId,
        email: adminEmail,
        full_name: 'Admin User',
        is_approved: true
      }, {
        onConflict: 'user_id'
      });

    if (profileError) {
      console.warn('⚠️  Warning creating profile:', profileError.message);
      console.log('   This might be okay if profile already exists');
    } else {
      console.log('✅ Admin profile created');
    }

    // Step 5: Verify email confirmation
    console.log('\nStep 5: Verifying email confirmation...');
    const { data: { user: verifyUser }, error: verifyError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (verifyError) {
      console.warn('⚠️  Warning verifying user:', verifyError.message);
    } else if (verifyUser) {
      if (verifyUser.email_confirmed_at) {
        console.log('✅ Email confirmed');
      } else {
        console.log('⚠️  Email not confirmed, updating...');
        await supabaseAdmin.auth.admin.updateUserById(userId, { email_confirm: true });
        console.log('✅ Email confirmed');
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Admin user setup complete!');
    console.log('='.repeat(50));
    console.log('\nLogin credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\nYou can now login to your app!');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
    console.log('\n' + '='.repeat(50));
    console.log('📝 Alternative: Create user manually');
    console.log('='.repeat(50));
    console.log('1. Go to Supabase Dashboard');
    console.log('2. Authentication > Users > Add User');
    console.log('3. Email: admin@datamorphosis.in');
    console.log('4. Password: password123');
    console.log('5. ✅ CHECK "Auto Confirm User"');
    console.log('6. Click "Create User"');
    console.log('7. Then run migration 006_auto_setup_admin_after_creation.sql');
    console.log('\n');
    process.exit(1);
  }
}

createAdminUser();

