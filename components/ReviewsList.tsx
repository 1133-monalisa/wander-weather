// components/ReviewsList.tsx
'use client'

import { useEffect, useState } from 'react'

type Review = {
  id: string
  userName: string
  rating: number
  text: string
  createdAt: string
}

export default function ReviewsList({ placeId }: { placeId: string }) {
  const [reviews, setReviews] = useState<Review[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    // Demo: replace with actual GET /api/reviews?placeId=...
    setTimeout(() => {
      if (!mounted) return
      setReviews([
        { id: 'r1', userName: 'Asha', rating: 5, text: 'Lovely place — visited in spring!', createdAt: '2025-03-12' },
        { id: 'r2', userName: 'Marco', rating: 4, text: 'Crowded but worth it.', createdAt: '2024-12-04' }
      ])
      setLoading(false)
    }, 400)
    return () => {
      mounted = false
    }
  }, [placeId])

  if (loading) return <div className="card p-4 rounded-2xl shadow">Loading reviews…</div>
  if (!reviews || reviews.length === 0) return <div className="card p-4 rounded-2xl shadow">No reviews yet. Be the first!</div>

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">Reviews</h3>
      <div className="space-y-3">
        {reviews.map((r) => (
          <article key={r.id} className="p-4 rounded-xl border">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{r.userName}</div>
              <div className="text-sm text-muted-foreground">{r.createdAt}</div>
            </div>
            <div className="mt-2 text-sm">{r.text}</div>
            <div className="mt-2 text-xs text-muted-foreground">Rating: {r.rating}/5</div>
          </article>
        ))}
      </div>
    </section>
  )
}
