
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function RoutinePage({ params }: { params: { id: string } }) {
  const [routine, setRoutine] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const { data, error } = await supabase
          .from('routines')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error

        setRoutine(data)
      } catch (err: any) {
        setError(err.message)
        console.error('Error fetching routine:', err)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchRoutine()
    }
  }, [params.id])

  if (loading) return <div className="container mx-auto p-4">Loading...</div>
  if (error) return <div className="container mx-auto p-4">Error: {error}</div>
  if (!routine) return <div className="container mx-auto p-4">Routine not found</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Personalized Protocol</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Supplements</h2>
          <pre>{JSON.stringify(routine.supplements, null, 2)}</pre>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Diet</h2>
          <pre>{JSON.stringify(routine.diet, null, 2)}</pre>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Exercise</h2>
          <pre>{JSON.stringify(routine.exercise, null, 2)}</pre>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Sleep Schedule</h2>
          <pre>{JSON.stringify(routine.sleep_schedule, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}
