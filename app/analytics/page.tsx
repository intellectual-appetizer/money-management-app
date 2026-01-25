'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnalyticsData, DateView } from '@/types'
import ChartComponents from '@/components/ChartComponents'
import DateFilter from '@/components/DateFilter'
import { createClient } from '@/lib/supabase/client'

export default function AnalyticsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<DateView>('monthly')
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      fetchAnalytics()
    }
    checkUser()
  }, [router, supabase, startDate, endDate])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate.toISOString())
      if (endDate) params.append('endDate', endDate.toISOString())

      const response = await fetch(`/api/analytics?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start)
    setEndDate(end)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6">
        <div className="text-center py-12">Loading...</div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6">
        <div className="text-center py-12">No data available</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>

      <div className="mb-6">
        <DateFilter
          view={view}
          onViewChange={setView}
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={handleDateRangeChange}
        />
      </div>

      <ChartComponents data={analytics} view={view} />
    </div>
  )
}

