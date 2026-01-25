'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { AnalyticsData } from '@/types'
import { formatCurrency } from '@/lib/utils'

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#FFC658',
  '#FF7C7C',
  '#8DD1E1',
  '#D084D0',
]

interface ChartComponentsProps {
  data: AnalyticsData
  view: 'daily' | 'monthly' | 'yearly'
}

export default function ChartComponents({ data, view }: ChartComponentsProps) {
  return (
    <div className="space-y-8">
      {/* Spending Trend Chart */}
      {view === 'daily' && data.daily.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Daily Spending Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#0088FE"
                strokeWidth={2}
                name="Total Spending"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {view === 'monthly' && data.monthly.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Monthly Spending</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="total" fill="#0088FE" name="Total Spending" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {view === 'yearly' && data.yearly.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Yearly Spending</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.yearly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="total" fill="#0088FE" name="Total Spending" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Breakdown Pie Chart */}
      {data.categoryBreakdown.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data.categoryBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percentage }) => `${category}: ${percentage.toFixed(1)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="total"
              >
                {data.categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

