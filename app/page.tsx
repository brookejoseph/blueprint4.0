
'use client'

import { createClient } from '@supabase/supabase-js'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: '',
    height: '',
    gender: '',
    improvement_areas: [],
    budget: '',
    equipment: [],
    current_health: {}
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // First create the user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{
          ...formData,
          age: parseInt(formData.age),
          weight: parseInt(formData.weight),
          height: parseInt(formData.height)
        }])
        .select()
        .single()

      if (userError) throw userError

      if (!userData?.id) throw new Error('No user ID returned')

      // Then create a routine for this user
      const { data: routineData, error: routineError } = await supabase
        .from('routines')
        .insert([{
          user_id: userData.id,
          supplements: [],
          diet: [],
          exercise: [],
          sleep_schedule: [],
          metrics: {},
          protocol_links: {},
          embedded_sections: []
        }])
        .select()
        .single()

      if (routineError) throw routineError

      if (routineData) {
        router.push(`/routine/${routineData.id}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to create profile and routine. Please try again.')
    }
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Your Protocol</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Name"
          className="w-full p-2 border rounded"
          required
        />
        <input 
          type="number"
          value={formData.age}
          onChange={(e) => setFormData({...formData, age: e.target.value})}
          placeholder="Age"
          className="w-full p-2 border rounded"
          required
        />
        <input 
          type="number"
          value={formData.weight}
          onChange={(e) => setFormData({...formData, weight: e.target.value})}
          placeholder="Weight"
          className="w-full p-2 border rounded"
          required
        />
        <input 
          type="number"
          value={formData.height}
          onChange={(e) => setFormData({...formData, height: e.target.value})}
          placeholder="Height"
          className="w-full p-2 border rounded"
          required
        />
        <select
          value={formData.gender}
          onChange={(e) => setFormData({...formData, gender: e.target.value})}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <input 
          type="text"
          value={formData.budget}
          onChange={(e) => setFormData({...formData, budget: e.target.value})}
          placeholder="Budget"
          className="w-full p-2 border rounded"
          required
        />
        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Generate Protocol
        </button>
      </form>
    </main>
  )
}
