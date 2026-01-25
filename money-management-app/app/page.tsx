'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Transaction, TransactionInput } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import Link from 'next/link'
import TransactionForm from '@/components/TransactionForm'

export default function Dashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [totalThisMonth, setTotalThisMonth] = useState(0)
  const [topCategory, setTopCategory] = useState<any>(null)

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)
      fetchData(user.id)
    }
    checkUser()
  }, [router, supabase])

  const fetchData = async (userId: string) => {
    try {
      setLoading(true)
      const now = new Date()
      const monthStart = startOfMonth(now)
      const monthEnd = endOfMonth(now)

      const params = new URLSearchParams({
        startDate: monthStart.toISOString(),
        endDate: monthEnd.toISOString(),
      })

      // Fetch transactions
      const transactionsResponse = await fetch(`/api/transactions?${params}`)
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json()
        setTransactions(transactionsData)

        // Calculate totals
        const total = transactionsData.reduce((sum: number, t: Transaction) => sum + t.amount, 0)
        setTotalThisMonth(total)

        // Calculate top category
        const categoryMap = new Map<string, number>()
        transactionsData.forEach((t: Transaction) => {
          categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount)
        })
        const sortedCategories = Array.from(categoryMap.entries())
          .map(([category, total]) => ({ category, total }))
          .sort((a, b) => b.total - a.total)
        setTopCategory(sortedCategories[0] || null)
      }

      // Fetch analytics for category breakdown
      const analyticsResponse = await fetch(`/api/analytics?${params}`)
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        if (analyticsData.categoryBreakdown && analyticsData.categoryBreakdown.length > 0) {
          setTopCategory(analyticsData.categoryBreakdown[0])
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: TransactionInput) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to save transaction')

      // Refresh data
      if (user) {
        await fetchData(user.id)
      }
    } catch (error) {
      throw error
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6">
        <div className="text-center py-12">Loading...</div>
      </div>
    )
  }

  const transactionCount = transactions.length
  const avgTransaction = transactionCount > 0 ? totalThisMonth / transactionCount : 0

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Transaction Form */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4">Add Transaction</h2>
        <TransactionForm onSubmit={handleSubmit} compact={true} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total This Month</h3>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalThisMonth)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Transactions</h3>
          <p className="text-3xl font-bold text-gray-900">{transactionCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Average Transaction</h3>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(avgTransaction)}</p>
        </div>
      </div>

      {/* Top Category */}
      {topCategory && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
          <h3 className="text-lg font-semibold mb-4">Top Spending Category</h3>
          <div className="flex items-center justify-between">
            <span className="text-xl font-medium">{topCategory.category}</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(topCategory.total)}
            </span>
          </div>
          {topCategory.percentage && (
            <p className="text-sm text-gray-600 mt-2">
              {topCategory.percentage.toFixed(1)}% of total spending
            </p>
          )}
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          <Link
            href="/transactions"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No transactions this month.</p>
            <p className="text-sm mt-2">Add a transaction using the form above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium">{transaction.category}</p>
                  <p className="text-sm text-gray-600">{transaction.date}</p>
                </div>
                <p className="font-semibold text-lg">{formatCurrency(transaction.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
