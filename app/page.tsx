
'use client'

import { createClient } from '@supabase/supabase-js'
import { useState } from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: '',
    height: '',
    gender: '',
    improvementAreas: [],
    budget: '',
    equipment: [],
    currentHealth: {}
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { data, error } = await supabase
      .from('users')
      .insert([formData])
      .select()
      .single()

    if (error) {
      console.error('Error:', error)
      return
    }

    if (data) {
      window.location.href = `/routine/${data.id}`
    }
  }

  return (
    <main className="container mx-auto p-4">
      <form onSubmit={handleSubmit}>
        <input 
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Name"
          className="border p-2 mb-2"
        />
        {/* Add other form fields similarly */}
        <button type="submit" className="bg-blue-500 text-white p-2">
          Generate Protocol
        </button>
      </form>
    </main>
  )
}
