import * as XLSX from 'xlsx'
import { Transaction } from '@/types'
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns'

export function generateExcel(transactions: Transaction[]): Buffer {
  const workbook = XLSX.utils.book_new()

  if (transactions.length === 0) {
    // Create empty workbook with one sheet
    const ws = XLSX.utils.aoa_to_sheet([['No transactions found']])
    XLSX.utils.book_append_sheet(workbook, ws, 'No Data')
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  }

  // Get date range
  const dates = transactions.map(t => parseISO(t.date))
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))

  // Create sheets for each month
  const months = eachMonthOfInterval({ start: minDate, end: maxDate })

  months.forEach(month => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    const monthTransactions = transactions.filter(t => {
      const date = parseISO(t.date)
      return date >= monthStart && date <= monthEnd
    })

    if (monthTransactions.length === 0) return

    // Sort by date
    monthTransactions.sort((a, b) => 
      parseISO(a.date).getTime() - parseISO(b.date).getTime()
    )

    // Prepare data
    const data: any[][] = [
      ['Date', 'Category', 'Amount', 'Comments'],
    ]

    monthTransactions.forEach(t => {
      data.push([
        format(parseISO(t.date), 'yyyy-MM-dd'),
        t.category,
        t.amount,
        t.comments || '',
      ])
    })

    // Add summary row
    const total = monthTransactions.reduce((sum, t) => sum + t.amount, 0)
    data.push([])
    data.push(['Total', '', total, ''])

    // Category breakdown
    const categoryTotals = monthTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

    data.push([])
    data.push(['Category Breakdown', '', '', ''])
    Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .forEach(([category, amount]) => {
        data.push([category, '', amount, ''])
      })

    const ws = XLSX.utils.aoa_to_sheet(data)
    const sheetName = format(month, 'MMM yyyy')
    XLSX.utils.book_append_sheet(workbook, ws, sheetName)
  })

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
}

