import { createClient } from '@supabase/supabase-js'

// Create a function that checks environment variables at runtime
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  console.log('Supabase environment check at runtime:', {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    hasServiceKey: !!supabaseServiceKey,
    url: supabaseUrl ? 'set' : 'missing',
    anonKeyLength: supabaseAnonKey.length,
    serviceKeyLength: supabaseServiceKey.length
  })

  // Use service role key for server-side operations, fallback to anon key
  const supabaseKey = supabaseServiceKey || supabaseAnonKey

  if (supabaseUrl && supabaseKey) {
    const client = createClient(supabaseUrl, supabaseKey)
    console.log('Supabase client created successfully')
    return client
  } else {
    console.warn('Supabase credentials not found at runtime. Missing:', {
      url: !supabaseUrl,
      key: !supabaseKey
    })
    console.warn('Will use file storage fallback.')
    return null
  }
}

// Export the client - this will be null if credentials are missing
const supabase = createSupabaseClient()

export default supabase
