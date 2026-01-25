# Quick Start Guide

## ✅ Step 1: Dependencies Installed
All npm packages have been installed successfully!

## 🔧 Step 2: Set Up Supabase (Required)

The app needs a Supabase database to work. Follow these steps:

### 2.1 Create Supabase Project
1. Go to https://supabase.com
2. Sign up or log in (free account)
3. Click "New Project"
4. Fill in:
   - Project name: `money-management-app` (or any name)
   - Database password: (choose a strong password, save it!)
   - Region: Choose closest to you
5. Click "Create new project"
6. Wait ~2 minutes for setup to complete

### 2.2 Get Your API Keys
1. In your Supabase project, go to **Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys" - keep this secret!)

### 2.3 Set Up Database Schema
1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click "New query"
3. Open the file `supabase-schema.sql` in this project
4. Copy ALL the SQL code
5. Paste it into the SQL Editor
6. Click "Run" (or press Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned"

### 2.4 Configure Environment Variables
1. Open `.env.local` in the project root
2. Replace the placeholder values with your actual Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-...  # Optional - only if you want AI insights
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:** 
- Replace `xxxxx` with your actual project reference ID
- The keys are long strings starting with `eyJ...`
- Don't commit `.env.local` to git (it's already in .gitignore)

## 🚀 Step 3: Start the App

The dev server should already be running! If not:

```bash
cd money-management-app
npm run dev
```

Then open: **http://localhost:3000**

## 🎯 Step 4: Test the App

1. **Sign Up**: Click "Sign Up" and create an account
2. **Add Transaction**: Go to Transactions → Add Transaction
3. **View Analytics**: Check the Analytics page for charts
4. **Export Data**: Click "Export to Excel" to download your data
5. **Get Insights**: Go to Insights page and click "Generate Insights" (requires OpenAI API key)

## 🔍 Troubleshooting

### "Unauthorized" errors
- Make sure you've set up the Supabase database schema
- Verify your `.env.local` file has correct values
- Check that RLS policies were created (in Supabase SQL Editor)

### Database connection errors
- Verify your Supabase project is active (free tier pauses after 1 week)
- Check that environment variables are correct
- Make sure you ran the SQL schema script

### AI Insights not working
- This is optional! The app works without it
- If you want AI insights, get an API key from https://platform.openai.com
- Add it to `.env.local` as `OPENAI_API_KEY`

### Port 3000 already in use
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

## 📱 Next Steps

- Add more transactions to see analytics
- Try different date ranges in Analytics
- Export your data to Excel
- Deploy to Vercel for free hosting (see README.md)

## 🆘 Need Help?

Check the main `README.md` for more detailed documentation.

