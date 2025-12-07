import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request) {
  try {
    const data = await request.formData()
    const file = data.get('file')

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log('Uploading file to Supabase Storage:', filename)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads') // Make sure this bucket exists in Supabase
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return new Response(JSON.stringify({ error: 'Upload failed', details: uploadError.message }), { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(filename)

    console.log('File uploaded successfully:', urlData.publicUrl)

    return new Response(JSON.stringify({ url: urlData.publicUrl }), { status: 200 })
  } catch (error) {
    console.error('Upload error:', error)
    return new Response(JSON.stringify({ error: 'Upload failed', details: error.message }), { status: 500 })
  }
}
