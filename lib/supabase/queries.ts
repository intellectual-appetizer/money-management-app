import { createClient } from './server'
import { Transaction, TransactionInput, AnalyticsData, DailyData, MonthlyData, YearlyData, CategoryData } from '@/types'
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO } from 'date-fns'

export async function getTransactions(userId: string, startDate?: Date, endDate?: Date, category?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (startDate) {
    query = query.gte('date', format(startDate, 'yyyy-MM-dd'))
  }
  if (endDate) {
    query = query.lte('date', format(endDate, 'yyyy-MM-dd'))
  }
  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Transaction[]
}

export async function getTransactionById(userId: string, id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data as Transaction
}

export async function createTransaction(userId: string, transaction: TransactionInput) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      ...transaction,
      user_id: userId,
    })
    .select()
    .single()

  if (error) throw error
  return data as Transaction
}

export async function updateTransaction(userId: string, id: string, transaction: Partial<TransactionInput>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .update(transaction)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data as Transaction
}

export async function deleteTransaction(userId: string, id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw error
}

export async function getAnalytics(userId: string, startDate?: Date, endDate?: Date): Promise<AnalyticsData> {
  const transactions = await getTransactions(userId, startDate, endDate)
  
  // Daily aggregation
  const dailyMap = new Map<string, { total: number; count: number }>()
  transactions.forEach(t => {
    const date = format(parseISO(t.date), 'yyyy-MM-dd')
    const existing = dailyMap.get(date) || { total: 0, count: 0 }
    dailyMap.set(date, {
      total: existing.total + t.amount,
      count: existing.count + 1,
    })
  })
  const daily: DailyData[] = Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Monthly aggregation
  const monthlyMap = new Map<string, { total: number; count: number; categories: Map<string, number> }>()
  transactions.forEach(t => {
    const month = format(parseISO(t.date), 'yyyy-MM')
    const existing = monthlyMap.get(month) || { total: 0, count: 0, categories: new Map() }
    existing.total += t.amount
    existing.count += 1
    existing.categories.set(t.category, (existing.categories.get(t.category) || 0) + t.amount)
    monthlyMap.set(month, existing)
  })
  const monthly: MonthlyData[] = Array.from(monthlyMap.entries())
    .map(([month, data]) => ({
      month,
      total: data.total,
      count: data.count,
      categories: Array.from(data.categories.entries()).map(([category, total]) => ({
        category,
        total,
        count: transactions.filter(t => 
          format(parseISO(t.date), 'yyyy-MM') === month && t.category === category
        ).length,
        percentage: (total / data.total) * 100,
      })),
    }))
    .sort((a, b) => a.month.localeCompare(b.month))

  // Yearly aggregation
  const yearlyMap = new Map<number, { total: number; count: number }>()
  transactions.forEach(t => {
    const year = parseISO(t.date).getFullYear()
    const existing = yearlyMap.get(year) || { total: 0, count: 0 }
    yearlyMap.set(year, {
      total: existing.total + t.amount,
      count: existing.count + 1,
    })
  })
  const yearly: YearlyData[] = Array.from(yearlyMap.entries())
    .map(([year, data]) => ({ year, ...data }))
    .sort((a, b) => a.year - b.year)

  // Category breakdown
  const categoryMap = new Map<string, { total: number; count: number }>()
  transactions.forEach(t => {
    const existing = categoryMap.get(t.category) || { total: 0, count: 0 }
    categoryMap.set(t.category, {
      total: existing.total + t.amount,
      count: existing.count + 1,
    })
  })
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)
  const categoryBreakdown: CategoryData[] = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      ...data,
      percentage: totalAmount > 0 ? (data.total / totalAmount) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)

  return {
    daily,
    monthly,
    yearly,
    categoryBreakdown,
  }
}

