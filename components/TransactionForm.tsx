'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Transaction, TransactionInput } from '@/types'
import { format } from 'date-fns'

const transactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  comments: z.string().optional(),
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface Category {
  id: string
  name: string
  color?: string
}

interface TransactionFormProps {
  transaction?: Transaction
  onSubmit: (data: TransactionInput) => Promise<void>
  onCancel?: () => void
  compact?: boolean
}

export default function TransactionForm({ transaction, onSubmit, onCancel, compact = false }: TransactionFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categorySuggestions, setCategorySuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [categoryInput, setCategoryInput] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction
      ? {
          amount: transaction.amount,
          category: transaction.category,
          date: transaction.date,
          comments: transaction.comments || '',
        }
      : {
          date: format(new Date(), 'yyyy-MM-dd'),
        },
  })

  useEffect(() => {
    // Fetch category suggestions from existing transactions
    const fetchCategorySuggestions = async () => {
      try {
        const response = await fetch('/api/transactions')
        if (response.ok) {
          const transactions = await response.json()
          // Get unique categories from transactions
          const uniqueCategories = Array.from(
            new Set(transactions.map((t: Transaction) => t.category).filter(Boolean))
          ).sort() as string[]
          setCategorySuggestions(uniqueCategories)
        }
      } catch (error) {
        console.error('Error fetching category suggestions:', error)
      }
    }
    fetchCategorySuggestions()
  }, [])

  useEffect(() => {
    if (transaction) {
      setCategoryInput(transaction.category)
    }
  }, [transaction])

  useEffect(() => {
    if (transaction) {
      reset({
        amount: transaction.amount,
        category: transaction.category,
        date: transaction.date,
        comments: transaction.comments || '',
      })
      setCategoryInput(transaction.category)
    }
  }, [transaction, reset])

  const filteredSuggestions = categoryInput
    ? categorySuggestions.filter(cat =>
        cat.toLowerCase().includes(categoryInput.toLowerCase())
      )
    : categorySuggestions

  const handleCategorySelect = (category: string) => {
    setCategoryInput(category)
    setValue('category', category)
    setShowSuggestions(false)
  }

  const onFormSubmit = async (data: TransactionFormData) => {
    try {
      setLoading(true)
      setError(null)
      await onSubmit(data)
      if (!transaction) {
        reset({
          amount: 0,
          category: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          comments: '',
        })
        setCategoryInput('')
        // Refresh suggestions to include the new category
        const response = await fetch('/api/transactions')
        if (response.ok) {
          const transactions = await response.json()
          const uniqueCategories = Array.from(
            new Set(transactions.map((t: Transaction) => t.category).filter(Boolean))
          ).sort() as string[]
          setCategorySuggestions(uniqueCategories)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          Amount ($)
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          {...register('amount', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
        )}
      </div>

      <div className="relative">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <input
          id="category"
          type="text"
          {...register('category')}
          value={categoryInput}
          onChange={(e) => {
            setCategoryInput(e.target.value)
            setValue('category', e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            // Delay to allow click on suggestion
            setTimeout(() => setShowSuggestions(false), 200)
          }}
          placeholder="Enter category (e.g., Food, Shopping)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          autoComplete="off"
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleCategorySelect(suggestion)}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        {categoryInput && filteredSuggestions.length === 0 && categorySuggestions.length > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            Press Enter to use "{categoryInput}" as a new category
          </p>
        )}
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Date
        </label>
        <input
          id="date"
          type="date"
          {...register('date')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
          Comments (Optional)
        </label>
        <textarea
          id="comments"
          {...register('comments')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className={`flex gap-2 ${compact ? 'flex-col' : ''}`}>
        <button
          type="submit"
          disabled={loading}
          className={`${compact ? 'w-full' : 'flex-1'} bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? 'Saving...' : transaction ? 'Update' : compact ? 'Add Transaction' : 'Add Transaction'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={`${compact ? 'w-full' : ''} px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

