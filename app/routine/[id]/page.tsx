
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function RoutinePage({ params }: { params: { id: string } }) {
  const [routine, setRoutine] = useState<any>(null)

  useEffect(() => {
    const fetchRoutine = async () => {
      const { data, error } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', params.id)
        .single()

      if (error) {
        console.error('Error:', error)
        return
      }

      setRoutine(data)
    }

    fetchRoutine()
  }, [params.id])

  if (!routine) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-4">
      <h1>Your Personalized Protocol</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Display routine data */}
      </div>
    </div>
  )
}
