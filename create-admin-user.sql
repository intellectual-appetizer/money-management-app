-- Create Admin User for Money Management App
-- Run this in Supabase SQL Editor

-- Step 1: Create the admin user
-- Replace 'admin@moneyapp.com' with your admin email
-- Replace 'admin123456' with your admin password
-- The password will be hashed automatically

DO $$
DECLARE
  admin_email TEXT := 'admin@moneyapp.com';  -- CHANGE THIS to your admin email
  admin_password TEXT := 'admin123456';     -- CHANGE THIS to your admin password
  user_id UUID;
BEGIN
  -- Check if user already exists
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = admin_email;

  -- If user doesn't exist, create it
  IF user_id IS NULL THEN
    -- Insert into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      last_sign_in_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      admin_email,
      crypt(admin_password, gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '',
      '',
      '',
      '',
      '{"provider":"email","providers":["email"]}',
      '{}',
      false,
      NOW()
    )
    RETURNING id INTO user_id;

    RAISE NOTICE 'Admin user created successfully with ID: %', user_id;
  ELSE
    RAISE NOTICE 'Admin user already exists with ID: %', user_id;
  END IF;
END $$;

-- Step 2: Verify the user was created
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'admin@moneyapp.com';  -- CHANGE THIS to match your admin email

-- Step 3: Make sure the user is confirmed (if not already)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'admin@moneyapp.com'  -- CHANGE THIS to match your admin email
  AND email_confirmed_at IS NULL;

