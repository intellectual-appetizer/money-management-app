-- Money Management App - Database Schema
-- Run this in Supabase SQL Editor

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
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
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(user_id, category);

-- Row Level Security (RLS) policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Categories table (user-specific categories)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#0088FE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Indexes for categories
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- Row Level Security for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;

-- Policy: Users can only see their own categories
CREATE POLICY "Users can view own categories"
    ON categories FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own categories
CREATE POLICY "Users can insert own categories"
    ON categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own categories
CREATE POLICY "Users can update own categories"
    ON categories FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own categories
CREATE POLICY "Users can delete own categories"
    ON categories FOR DELETE
    USING (auth.uid() = user_id);

-- Insert default categories for new users (via trigger)
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO categories (user_id, name, color) VALUES
    (NEW.id, 'Food & Dining', '#FF6B6B'),
    (NEW.id, 'Shopping', '#4ECDC4'),
    (NEW.id, 'Transportation', '#45B7D1'),
    (NEW.id, 'Bills & Utilities', '#FFA07A'),
    (NEW.id, 'Entertainment', '#98D8C8'),
    (NEW.id, 'Healthcare', '#F7DC6F'),
    (NEW.id, 'Education', '#BB8FCE'),
    (NEW.id, 'Travel', '#85C1E2'),
    (NEW.id, 'Personal Care', '#F8B88B'),
    (NEW.id, 'Gifts & Donations', '#AED6F1'),
    (NEW.id, 'Other', '#D5DBDB')
    ON CONFLICT (user_id, name) DO NOTHING;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create default categories when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_categories();

