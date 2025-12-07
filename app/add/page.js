'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AddContent() {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [contentType, setContentType] = useState('image')
  const [image, setImage] = useState('')
  const [externalUrl, setExternalUrl] = useState('')
  const [platform, setPlatform] = useState('none')
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth', { method: 'GET' })
        if (!response.ok) {
          router.push('/login')
          return
        }
      } catch (error) {
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        const data = await res.json()
        setImage(data.url)
      } catch (error) {
        alert('Upload failed. Please try again.')
      }
      setUploading(false)
    }
  }

  const isValidYouTubeUrl = (url) => {
    if (!url) return false
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
    ]
    return patterns.some(pattern => pattern.test(url))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (contentType === 'image' && !image) {
      alert('Please upload an image')
      return
    }
    if ((contentType === 'video' || contentType === 'post') && !externalUrl) {
      alert('Please provide a URL')
      return
    }
    if (contentType === 'video' && !isValidYouTubeUrl(externalUrl)) {
      alert('Please provide a valid YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID)')
      return
    }

    try {
      const payload = {
        title,
        text,
        contentType,
        ...(contentType === 'image' && { image }),
        ...((contentType === 'video' || contentType === 'post') && { externalUrl, platform }),
      }

      await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      router.push('/view')
    } catch (error) {
      alert('Failed to add content. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Content
            </h1>
            <p className="text-green-100 mt-2">Share your amazing content with the world</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Content Type Selection */}
            <div className="space-y-2">
              <label className="flex items-center text-gray-700 font-semibold text-lg">
                <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Content Type
              </label>
              <select
                value={contentType}
                onChange={(e) => {
                  setContentType(e.target.value)
                  setImage('')
                  setExternalUrl('')
                }}
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-lg"
              >
                <option value="image">Image</option>
                <option value="video">Video (YouTube, etc.)</option>
                <option value="post">Social Media Post</option>
              </select>
            </div>

            {/* Image Upload */}
            {contentType === 'image' && (
              <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-semibold text-lg">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {uploading && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
                {image && (
                  <div className="mt-4 relative group">
                    <img src={image} alt="Preview" className="w-full h-48 object-cover rounded-xl shadow-lg" />
                  </div>
                )}
              </div>
            )}

            {/* External URL Input */}
            {(contentType === 'video' || contentType === 'post') && (
              <>
                <div className="space-y-2">
                  <label className="flex items-center text-gray-700 font-semibold text-lg">
                    <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    URL
                  </label>
                  <input
                    type="url"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200 text-lg"
                    placeholder={contentType === 'video' ? "Paste YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID)" : "Paste Instagram, Facebook, or TikTok URL..."}
                    required={contentType !== 'image'}
                  />
                </div>

                {contentType === 'post' && (
                  <div className="space-y-2">
                    <label className="flex items-center text-gray-700 font-semibold text-lg">
                      <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4" />
                      </svg>
                      Platform
                    </label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 text-lg"
                    >
                      <option value="none">None</option>
                      <option value="youtube">YouTube</option>
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="twitter">Twitter</option>
                      <option value="tiktok">TikTok</option>
                    </select>
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <label className="flex items-center text-gray-700 font-semibold text-lg">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 text-lg"
                placeholder="Enter an engaging title..."
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-gray-700 font-semibold text-lg">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Description (Optional)
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-lg resize-vertical min-h-[120px]"
                placeholder="Write your amazing content here..."
              />
            </div>

            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.push('/view')}
                className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors duration-200 font-semibold flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-semibold flex items-center justify-center transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Content
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
