'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function InsightsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [insights, setInsights] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      }
    }
    checkUser()
  }, [router, supabase])

  const generateInsights = async () => {
    try {
      setLoading(true)
      setError(null)
      setInsights(null)

      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate insights')
      }

      const data = await response.json()
      setInsights(data.insights)
    } catch (err: any) {
      setError(err.message || 'Failed to generate insights')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">AI Insights</h1>
        <button
          onClick={generateInsights}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Generate Insights'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {insights && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Your Financial Insights</h2>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-gray-700 font-sans">
              {insights}
            </pre>
          </div>
        </div>
      )}

      {!insights && !loading && !error && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center py-12">
          <p className="text-gray-600 mb-4">
            Click the button above to generate AI-powered insights about your spending patterns.
          </p>
          <p className="text-sm text-gray-500">
            Insights are based on your transaction history and provide recommendations for better financial management.
          </p>
        </div>
      )}
    </div>
  )
}

