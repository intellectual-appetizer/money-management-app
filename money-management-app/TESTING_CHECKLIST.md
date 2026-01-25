# Testing Checklist

## ✅ Completed Setup Steps

1. ✅ **Dependencies Installed** - All npm packages installed (470 packages)
2. ✅ **Dev Server Started** - Running in background on port 3000
3. ✅ **Project Structure** - All files created and configured
4. ✅ **TypeScript** - No linting errors
5. ✅ **Font Issue Fixed** - Removed Google Fonts dependency

## 🔴 Required: Set Up Supabase (5 minutes)

**You MUST complete this before testing:**

### Quick Steps:
1. **Create Supabase Account** → https://supabase.com (free)
2. **Create New Project** → Wait ~2 minutes
3. **Get API Keys** → Settings → API → Copy URL and keys
4. **Run SQL Schema** → SQL Editor → Paste `supabase-schema.sql` → Run
5. **Update .env.local** → Add your Supabase credentials

**Detailed instructions:** See `QUICK_START.md`

## 🧪 Testing Steps

Once Supabase is configured:

### 1. Access the App
- Open: **http://localhost:3000**
- You should see the login page

### 2. Create Account
- Click "Sign Up"
- Enter email and password
- You'll be redirected to Dashboard

### 3. Add Transactions
- Go to "Transactions" page
- Click "Add Transaction"
- Fill in:
  - Amount: `50.00`
  - Category: `Food & Dining`
  - Date: Today's date
  - Comments: `Test transaction`
- Click "Add Transaction"
- Verify it appears in the list

### 4. Test Analytics
- Go to "Analytics" page
- You should see:
  - Daily/Monthly/Yearly toggle buttons
  - Charts (may be empty if no data)
- Add more transactions with different dates/categories
- Refresh to see charts populate

### 5. Test Excel Export
- Go to "Transactions" page
- Click "Export to Excel"
- File should download with `.xlsx` extension
- Open in Excel/Sheets to verify data

### 6. Test AI Insights (Optional)
- Go to "Insights" page
- Click "Generate Insights"
- If OpenAI key is set: You'll get AI-generated insights
- If not set: You'll see a helpful error message

### 7. Test Mobile View
- Open browser DevTools (F12)
- Toggle device toolbar (mobile view)
- Verify:
  - Bottom navigation appears
  - Forms are touch-friendly
  - Charts are responsive

## 🐛 Common Issues & Fixes

### Issue: "Failed to fetch" errors
**Fix:** Check `.env.local` has correct Supabase credentials

### Issue: "Unauthorized" errors
**Fix:** Make sure you ran the SQL schema in Supabase

### Issue: Can't sign up
**Fix:** 
- Check Supabase project is active
- Verify email isn't already registered
- Check browser console for errors

### Issue: Charts not showing
**Fix:** Add transactions with different dates to see data

### Issue: Port 3000 in use
**Fix:** 
```bash
# Stop the current server (Ctrl+C in terminal)
# Or use different port:
PORT=3001 npm run dev
```

## 📊 Expected Behavior

- ✅ Login/Signup works
- ✅ Transactions can be added/edited/deleted
- ✅ Dashboard shows summary stats
- ✅ Analytics page shows charts
- ✅ Excel export downloads file
- ✅ Mobile navigation works
- ✅ All pages are responsive

## 🚀 Next Steps After Testing

1. **Add Real Data** - Start tracking your actual expenses
2. **Customize Categories** - Edit categories in `TransactionForm.tsx`
3. **Deploy to Vercel** - See `README.md` for deployment steps
4. **Set Up OpenAI** - Get API key for AI insights feature

## 📝 Notes

- The app uses Supabase free tier (500MB database)
- Free tier pauses after 1 week of inactivity
- OpenAI API is optional (app works without it)
- All data is user-scoped and secure (RLS enabled)

