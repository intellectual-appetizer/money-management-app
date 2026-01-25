'use client'

import { DateView } from '@/types'
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears } from 'date-fns'

interface DateFilterProps {
  view: DateView
  onViewChange: (view: DateView) => void
  startDate?: Date
  endDate?: Date
  onDateRangeChange?: (start: Date, end: Date) => void
}

export default function DateFilter({
  view,
  onViewChange,
  startDate,
  endDate,
  onDateRangeChange,
}: DateFilterProps) {
  const handleQuickFilter = (period: 'month' | 'year' | 'all') => {
    if (!onDateRangeChange) return

    const now = new Date()
    let start: Date
    let end: Date = now

    switch (period) {
      case 'month':
        start = startOfMonth(now)
        end = endOfMonth(now)
        break
      case 'year':
        start = startOfYear(now)
        end = endOfYear(now)
        break
      default:
        start = new Date(2000, 0, 1)
        end = now
    }

    onDateRangeChange(start, end)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => onViewChange('daily')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            view === 'daily'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Daily
        </button>
        <button
          onClick={() => onViewChange('monthly')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            view === 'monthly'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => onViewChange('yearly')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            view === 'yearly'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Yearly
        </button>
      </div>

      {onDateRangeChange && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleQuickFilter('month')}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            This Month
          </button>
          <button
            onClick={() => handleQuickFilter('year')}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            This Year
          </button>
          <button
            onClick={() => handleQuickFilter('all')}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            All Time
          </button>
        </div>
      )}

      {startDate && endDate && (
        <div className="text-sm text-gray-600">
          {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
        </div>
      )}
    </div>
  )
}

