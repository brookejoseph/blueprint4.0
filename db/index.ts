
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fswlkwqzrsomwkkaihfb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzd2xrd3F6cnNvbXdra2FpaGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwNDY4MjUsImV4cCI6MjA1MjYyMjgyNX0.TO_VsoXijDKc-zO2-WlmWCUdeWoyJNkyP8GT-VNrq3w'

export const supabase = createClient(supabaseUrl, supabaseKey)
