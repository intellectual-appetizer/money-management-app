# Dynamic Categories Update

## What Changed

1. **Categories are now dynamic** - Stored in database, user-specific
2. **Home page has transaction form** - You can add transactions directly from the dashboard
3. **Add categories on the fly** - Click "+ Add Category" in the transaction form

## Database Update Required

You need to run the updated SQL schema in Supabase:

1. Go to Supabase → SQL Editor
2. Open `supabase-schema.sql` 
3. Copy the NEW sections (categories table and trigger)
4. Paste and run in SQL Editor

Or run this SQL directly:

```sql
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

-- Policies
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
CREATE POLICY "Users can view own categories"
    ON categories FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
CREATE POLICY "Users can insert own categories"
    ON categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own categories" ON categories;
CREATE POLICY "Users can update own categories"
    ON categories FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own categories" ON categories;
CREATE POLICY "Users can delete own categories"
    ON categories FOR DELETE
    USING (auth.uid() = user_id);

-- Function to create default categories for new users
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

-- Create default categories for existing users
INSERT INTO categories (user_id, name, color)
SELECT id, 'Food & Dining', '#FF6B6B' FROM auth.users
WHERE id NOT IN (SELECT DISTINCT user_id FROM categories WHERE name = 'Food & Dining')
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO categories (user_id, name, color)
SELECT id, 'Shopping', '#4ECDC4' FROM auth.users
WHERE id NOT IN (SELECT DISTINCT user_id FROM categories WHERE name = 'Shopping')
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO categories (user_id, name, color)
SELECT id, 'Transportation', '#45B7D1' FROM auth.users
WHERE id NOT IN (SELECT DISTINCT user_id FROM categories WHERE name = 'Transportation')
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO categories (user_id, name, color)
SELECT id, 'Bills & Utilities', '#FFA07A' FROM auth.users
WHERE id NOT IN (SELECT DISTINCT user_id FROM categories WHERE name = 'Bills & Utilities')
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO categories (user_id, name, color)
SELECT id, 'Entertainment', '#98D8C8' FROM auth.users
WHERE id NOT IN (SELECT DISTINCT user_id FROM categories WHERE name = 'Entertainment')
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO categories (user_id, name, color)
SELECT id, 'Healthcare', '#F7DC6F' FROM auth.users
WHERE id NOT IN (SELECT DISTINCT user_id FROM categories WHERE name = 'Healthcare')
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO categories (user_id, name, color)
SELECT id, 'Education', '#BB8FCE' FROM auth.users
WHERE id NOT IN (SELECT DISTINCT user_id FROM categories WHERE name = 'Education')
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO categories (user_id, name, color)
SELECT id, 'Travel', '#85C1E2' FROM auth.users
WHERE id NOT IN (SELECT DISTINCT user_id FROM categories WHERE name = 'Travel')
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO categories (user_id, name, color)
SELECT id, 'Personal Care', '#F8B88B' FROM auth.users
WHERE id NOT IN (SELECT DISTINCT user_id FROM categories WHERE name = 'Personal Care')
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO categories (user_id, name, color)
SELECT id, 'Gifts & Donations', '#AED6F1' FROM auth.users
WHERE id NOT IN (SELECT DISTINCT user_id FROM categories WHERE name = 'Gifts & Donations')
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO categories (user_id, name, color)
SELECT id, 'Other', '#D5DBDB' FROM auth.users
WHERE id NOT IN (SELECT DISTINCT user_id FROM categories WHERE name = 'Other')
ON CONFLICT (user_id, name) DO NOTHING;
```

## Features

### 1. Dynamic Categories
- Each user has their own categories
- Categories are stored in the database
- Default categories are created automatically when a user signs up
- Users can add custom categories on the fly

### 2. Home Page Transaction Form
- The dashboard (home page) now has a transaction form at the top
- You can add transactions directly from the home page
- Form is compact and user-friendly

### 3. Add Categories On-the-Fly
- In the transaction form, click "+ Add Category"
- Enter a new category name
- It's immediately available for selection

## Testing

1. **Run the SQL update** in Supabase
2. **Restart your dev server**
3. **Go to the home page** - you should see the transaction form
4. **Try adding a transaction** - categories should load from database
5. **Click "+ Add Category"** - add a custom category
6. **Select your new category** - it should appear in the dropdown

## Notes

- Existing users will get default categories created automatically
- New users get default categories when they sign up (via trigger)
- Categories are user-specific (each user has their own set)
- You can't delete categories yet (feature can be added later)

