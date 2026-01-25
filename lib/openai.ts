import OpenAI from 'openai'
import { Transaction } from '@/types'

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null

export async function generateInsights(transactions: Transaction[]): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI API key not configured')
  }

  // Prepare transaction summary
  const totalTransactions = transactions.length
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)
  const categoryBreakdown = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount
    return acc
  }, {} as Record<string, number>)

  const topCategories = Object.entries(categoryBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([category, amount]) => `${category}: $${amount.toFixed(2)}`)

  const prompt = `You are a financial advisor analyzing spending data. Provide insights and recommendations based on the following transaction data:

Total Transactions: ${totalTransactions}
Total Amount: $${totalAmount.toFixed(2)}
Top Categories:
${topCategories.map(c => `- ${c}`).join('\n')}

Recent transactions (last 10):
${transactions.slice(0, 10).map(t => 
  `${t.date}: $${t.amount.toFixed(2)} - ${t.category}${t.comments ? ` (${t.comments})` : ''}`
).join('\n')}

Provide:
1. Key spending patterns and trends
2. Areas where spending could be optimized
3. Recommendations for better financial management
4. Any notable observations

Keep the response concise, actionable, and friendly. Format as bullet points.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful financial advisor providing insights on spending patterns.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 500,
    temperature: 0.7,
  })

  return completion.choices[0]?.message?.content || 'Unable to generate insights at this time.'
}

