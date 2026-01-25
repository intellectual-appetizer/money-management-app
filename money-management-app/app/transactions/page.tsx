'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Transaction, TransactionInput } from '@/types'
import TransactionList from '@/components/TransactionList'
import TransactionForm from '@/components/TransactionForm'
import ExportButton from '@/components/ExportButton'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function TransactionsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      fetchTransactions()
    }
    checkUser()
  }, [router, supabase])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/transactions')
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: TransactionInput) => {
    try {
      const url = editingTransaction
        ? `/api/transactions/${editingTransaction.id}`
        : '/api/transactions'
      const method = editingTransaction ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to save transaction')

      await fetchTransactions()
      setEditingTransaction(null)
      setShowForm(false)
    } catch (error) {
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete transaction')

      await fetchTransactions()
    } catch (error) {
      alert('Failed to delete transaction')
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6">
        <div className="text-center py-12">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <div className="flex gap-2">
          <ExportButton />
          {!showForm && (
            <button
              onClick={() => {
                setEditingTransaction(null)
                setShowForm(true)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Transaction
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <TransactionForm
            transaction={editingTransaction || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false)
              setEditingTransaction(null)
            }}
          />
        </div>
      )}

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <TransactionList
          transactions={transactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}

