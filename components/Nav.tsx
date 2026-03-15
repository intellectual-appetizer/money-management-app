// Add these two links alongside existing Finance, Analytics, AI Insights, etc.
// If your nav file has different structure, insert these <Link> items in the same list.

import Link from 'next/link';
/* ... inside your nav markup ... */
<nav className="flex gap-4">
  <Link href="/"><a>Finance</a></Link>
  <Link href="/gym"><a>Gym</a></Link>
  <Link href="/food"><a>Food</a></Link>
  <Link href="/analytics"><a>Analytics</a></Link>
  <Link href="/ai-insights"><a>AI Insights</a></Link>
</nav>