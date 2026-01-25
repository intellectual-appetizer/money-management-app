# Create Admin User - Step by Step Guide

## Option 1: Using Supabase Dashboard (Easiest - Recommended)

### Step 1: Go to Authentication
1. Open your Supabase project dashboard
2. Click **"Authentication"** in the left sidebar
3. Click **"Users"** tab

### Step 2: Create New User
1. Click the **"Add user"** button (top right)
2. Select **"Create new user"**
3. Fill in the form:
   - **Email**: `admin@moneyapp.com` (or your preferred admin email)
   - **Password**: `admin123456` (or your preferred password - make it strong!)
   - ✅ **Check "Auto Confirm User"** (VERY IMPORTANT!)
   - **Send invitation email**: Leave unchecked
4. Click **"Create user"**

### Step 3: Verify User Created
- You should see the new user in the users list
- The email should show as confirmed (green checkmark)

### Step 4: Update .env.local
Make sure your `.env.local` has matching credentials:

```bash
ADMIN_EMAIL=admin@moneyapp.com
ADMIN_PASSWORD=admin123456
```

**Important**: Use the EXACT same email and password you just created!

---

## Option 2: Using SQL Script (Alternative)

If the dashboard method doesn't work, use SQL:

### Step 1: Open SQL Editor
1. In Supabase dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"New query"**

### Step 2: Run the SQL Script
1. Open the file `create-admin-user.sql` in this project
2. **IMPORTANT**: Edit these lines before running:
   ```sql
   admin_email TEXT := 'admin@moneyapp.com';  -- Change to your email
   admin_password TEXT := 'admin123456';      -- Change to your password
   ```
3. Copy the entire script
4. Paste into SQL Editor
5. Click **"Run"** (or press Cmd/Ctrl + Enter)

### Step 3: Verify
You should see a message like: "Admin user created successfully"

### Step 4: Update .env.local
Add matching credentials to `.env.local`:

```bash
ADMIN_EMAIL=admin@moneyapp.com
ADMIN_PASSWORD=admin123456
```

---

## Step 5: Test Admin Login

1. **Restart your dev server**:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. Go to http://localhost:3000/auth/login

3. Click the purple **"🔐 Admin Login"** button

4. You should be logged in automatically!

---

## Troubleshooting

### "Admin user not found" error persists?

1. **Check user exists in Supabase**:
   - Go to Authentication → Users
   - Look for your admin email
   - Make sure it shows as "Confirmed"

2. **Verify .env.local**:
   ```bash
   # Check your .env.local file
   cat .env.local | grep ADMIN
   ```
   - Make sure ADMIN_EMAIL and ADMIN_PASSWORD are set
   - Email must match EXACTLY (case-sensitive)
   - Password must match EXACTLY

3. **Restart dev server**:
   - Environment variables only load on server start
   - Stop server (Ctrl+C) and run `npm run dev` again

4. **Check Supabase project is active**:
   - Free tier projects pause after 1 week of inactivity
   - If paused, click "Restore" in Supabase dashboard

### User exists but still getting error?

- Make sure "Auto Confirm User" was checked when creating
- Try updating the user manually:
  ```sql
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE email = 'admin@moneyapp.com';
  ```

### Password not working?

- Reset password in Supabase: Authentication → Users → Click user → Reset password
- Or update password in SQL:
  ```sql
  UPDATE auth.users
  SET encrypted_password = crypt('new_password_here', gen_salt('bf'))
  WHERE email = 'admin@moneyapp.com';
  ```
- Update ADMIN_PASSWORD in `.env.local` to match

---

## Security Notes

- **Change the default password** to something strong
- **Never commit .env.local** to git (already in .gitignore)
- **Keep admin credentials secure**
- In production, use environment variables in your hosting platform

---

## Quick Checklist

- [ ] Admin user created in Supabase (Authentication → Users)
- [ ] "Auto Confirm User" was checked
- [ ] User shows as "Confirmed" in Supabase
- [ ] ADMIN_EMAIL added to .env.local
- [ ] ADMIN_PASSWORD added to .env.local
- [ ] Dev server restarted
- [ ] Admin login button works

