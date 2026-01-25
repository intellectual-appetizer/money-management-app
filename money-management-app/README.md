# Money Management App

A production-ready mobile-first web application for tracking and managing personal finances with transaction tracking, analytics, Excel export, and AI-powered insights.

## Features

- ✅ User authentication (email/password)
- ✅ Transaction management (add, edit, delete)
- ✅ Daily, monthly, and yearly analytics
- ✅ Interactive charts (line, bar, pie)
- ✅ Excel export with monthly sheets
- ✅ AI-powered financial insights
- ✅ Mobile-responsive design
- ✅ Free hosting on Vercel + Supabase

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Excel Export**: xlsx (SheetJS)
- **AI**: OpenAI API (optional)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available)
- OpenAI API key (optional, for AI insights)

### Installation

1. Clone the repository:
```bash
cd money-management-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Configure `.env.local` with your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key_here  # Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Run the following SQL in the Supabase SQL Editor:

```sql
-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(user_id, date);
CREATE INDEX idx_transactions_category ON transactions(user_id, category);

-- Row Level Security (RLS) policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own transactions
CREATE POLICY "Users can view own transactions"
    ON transactions FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own transactions
CREATE POLICY "Users can insert own transactions"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own transactions
CREATE POLICY "Users can update own transactions"
    ON transactions FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own transactions
CREATE POLICY "Users can delete own transactions"
    ON transactions FOR DELETE
    USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

3. Get your Supabase credentials from Project Settings > API

### Running the App

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Sign up for a new account or sign in

## Deployment

### Deploy to Vercel

1. Push your code to GitHub

2. Import your repository in [Vercel](https://vercel.com)

3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY` (optional)

4. Deploy!

The app will be live at `https://your-app.vercel.app`

## Free Hosting

This app can be hosted completely free:

- **Vercel**: Free tier (100GB bandwidth/month)
- **Supabase**: Free tier (500MB database, 2GB bandwidth)
- **OpenAI**: Pay-per-use (~$0-5/month for personal use) OR use Hugging Face free tier

## Project Structure

```
money-management-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── transactions/      # Transaction pages
│   ├── analytics/         # Analytics page
│   └── insights/          # AI insights page
├── components/            # React components
├── lib/                   # Utility functions
├── types/                 # TypeScript types
└── public/                # Static assets
```

## License

MIT

