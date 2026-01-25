import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTransactions } from '@/lib/supabase/queries'
import { generateInsights } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const startDate = body.startDate ? new Date(body.startDate) : undefined
    const endDate = body.endDate ? new Date(body.endDate) : undefined

    const transactions = await getTransactions(user.id, startDate, endDate)

    if (transactions.length === 0) {
      return NextResponse.json({
        insights: 'No transactions found. Add some transactions to get insights!',
      })
    }

    const insights = await generateInsights(transactions)

    return NextResponse.json({ insights })
  } catch (error) {
    console.error('Error generating insights:', error)
    
    if (error instanceof Error && error.message.includes('OpenAI API key')) {
      return NextResponse.json(
        { error: 'AI insights are not configured. Please set up OpenAI API key.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}

