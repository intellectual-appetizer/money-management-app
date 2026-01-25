# Quick Setup Guide

## Step 1: Install Dependencies

```bash
cd money-management-app
npm install
```

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to be ready (takes ~2 minutes)
4. Go to Project Settings > API
5. Copy your project URL and anon key

## Step 3: Set Up Database

1. In Supabase, go to SQL Editor
2. Copy and paste the contents of `supabase-schema.sql`
3. Run the SQL script
4. Verify the `transactions` table was created

## Step 4: Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
OPENAI_API_KEY=your-openai-key-here  # Optional - only needed for AI insights
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Where to find these values:**
- `NEXT_PUBLIC_SUPABASE_URL`: Project Settings > API > Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Project Settings > API > anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: Project Settings > API > service_role key (keep this secret!)
- `OPENAI_API_KEY`: Get from [platform.openai.com](https://platform.openai.com) (optional)

## Step 5: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 6: Create Your First Account

1. Click "Sign Up"
2. Enter your email and password
3. You'll be automatically signed in
4. Start adding transactions!

## Troubleshooting

### Database connection issues
- Make sure your Supabase project is active (free tier pauses after 1 week of inactivity)
- Verify your environment variables are correct
- Check that the SQL schema was run successfully

### Authentication not working
- Ensure RLS policies are set up correctly
- Check browser console for errors
- Verify Supabase project is not paused

### AI insights not working
- Make sure `OPENAI_API_KEY` is set in `.env.local`
- Check that you have credits in your OpenAI account
- The feature will gracefully degrade if the key is missing

## Next Steps

- Deploy to Vercel for free hosting
- Add more transaction categories
- Customize the UI colors and styling
- Add more analytics features

