# Admin Login Setup Guide

## Quick Setup

The admin login feature allows you to bypass the signup process and log in directly as an admin user.

## Step 1: Create Admin User in Supabase

You need to create an admin user account in Supabase. Here are two methods:

### Method 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users** (left sidebar)
3. Click **"Add user"** → **"Create new user"**
4. Fill in:
   - **Email**: `admin@moneyapp.com` (or your preferred admin email)
   - **Password**: Choose a strong password (save it!)
   - **Auto Confirm User**: ✅ Check this box (important!)
5. Click **"Create user"**

### Method 2: Using SQL (Alternative)

1. Go to **SQL Editor** in Supabase
2. Run this SQL (replace with your email and password):

```sql
-- Create admin user
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
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@moneyapp.com',  -- Change this to your admin email
  crypt('your_admin_password_here', gen_salt('bf')),  -- Change this to your password
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Get the user ID (you'll need this)
SELECT id, email FROM auth.users WHERE email = 'admin@moneyapp.com';
```

**Note**: The SQL method is more complex. Method 1 (Dashboard) is easier.

## Step 2: Configure Admin Credentials

Add these to your `.env.local` file:

```bash
# Admin Login Credentials
ADMIN_EMAIL=admin@moneyapp.com
ADMIN_PASSWORD=your_admin_password_here
```

**Important**: 
- Use the same email you created in Supabase
- Use the same password you set in Supabase
- Keep these credentials secure!

## Step 3: Restart Dev Server

After updating `.env.local`, restart your dev server:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 4: Test Admin Login

1. Go to http://localhost:3000/auth/login
2. Click the **"🔐 Admin Login"** button (purple button)
3. You should be logged in automatically as admin
4. You'll be redirected to the dashboard

## Troubleshooting

### "Admin user not found" error
- Make sure you created the admin user in Supabase
- Verify the email matches exactly (case-sensitive)
- Check that "Auto Confirm User" was checked when creating the user
- Try creating the user again via Supabase Dashboard

### "Failed to create admin session" error
- Check that `.env.local` has `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- Verify the credentials match the Supabase user exactly
- Restart the dev server after updating `.env.local`

### Admin login button doesn't appear
- Make sure you're on the `/auth/login` page
- Check browser console for errors
- Verify the component was saved correctly

## Security Notes

- **Never commit `.env.local` to git** (it's already in .gitignore)
- **Change the default admin password** immediately
- **Use a strong password** for admin account
- **Keep admin credentials secure** - don't share them
- In production, use environment variables in your hosting platform (Vercel, etc.)

## Production Deployment

When deploying to Vercel or other platforms:

1. Add `ADMIN_EMAIL` and `ADMIN_PASSWORD` to your platform's environment variables
2. Use the same credentials as your Supabase admin user
3. Never expose these values in client-side code

## Multiple Admin Users

You can create multiple admin users in Supabase. Just use different emails and add them to `.env.local`:

```bash
ADMIN_EMAIL=admin1@moneyapp.com,admin2@moneyapp.com
```

Or create separate environment variables for each admin.

