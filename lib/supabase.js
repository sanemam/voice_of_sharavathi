import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

console.log('Supabase environment check:', {
  hasUrl: !!supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  hasServiceKey: !!supabaseServiceKey,
  url: supabaseUrl ? 'set' : 'missing'
})

// Use service role key for server-side operations, fallback to anon key
const supabaseKey = supabaseServiceKey || supabaseAnonKey

let supabase = null

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
  console.log('Supabase initialized successfully with URL:', supabaseUrl)
} else {
  console.warn('Supabase credentials not found. Missing:', {
    url: !supabaseUrl,
    key: !supabaseKey
  })
  console.warn('Using file storage fallback.')
}

export default supabase
