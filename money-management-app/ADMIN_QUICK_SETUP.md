# Admin Login - Quick Setup (2 minutes)

## Step 1: Create Admin User in Supabase

1. Go to your Supabase Dashboard → **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Enter:
   - **Email**: `admin@moneyapp.com` (or your preferred email)
   - **Password**: `admin123456` (or your preferred password)
   - ✅ **Check "Auto Confirm User"** (important!)
4. Click **"Create user"**

## Step 2: Add Admin Credentials to .env.local

Open `.env.local` and add these lines at the end:

```bash
# Admin Login Credentials
ADMIN_EMAIL=admin@moneyapp.com
ADMIN_PASSWORD=admin123456
```

**Important**: Use the same email and password you created in Supabase!

## Step 3: Restart Dev Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

## Step 4: Test Admin Login

1. Go to http://localhost:3000/auth/login
2. Click the purple **"🔐 Admin Login"** button
3. You'll be logged in automatically!

## That's it! 🎉

Now you can:
- Use **Admin Login** button to bypass signup (for you)
- Other users can still use **Sign Up** normally

## Troubleshooting

**"Admin user not found" error?**
- Make sure you created the user in Supabase
- Check that "Auto Confirm User" was checked
- Verify email/password match exactly in `.env.local`

**Button not working?**
- Make sure you restarted the dev server
- Check browser console for errors
- Verify `.env.local` has ADMIN_EMAIL and ADMIN_PASSWORD

