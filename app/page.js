'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ManagePage() {
  const [contents, setContents] = useState([])
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [likes, setLikes] = useState({})
  const [readProgress, setReadProgress] = useState(0)
  const [currentTheme, setCurrentTheme] = useState('blue')
  const containerRef = useRef(null)
  const router = useRouter()

  const themes = {
    blue: 'from-blue-50 to-indigo-100',
    purple: 'from-purple-50 to-pink-100',
    green: 'from-green-50 to-emerald-100',
    orange: 'from-orange-50 to-red-100'
  }

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth', { method: 'GET' })
        if (!response.ok) {
          router.push('/login')
          return
        }
        setAuthChecked(true)
      } catch (error) {
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    if (!authChecked) return // Don't fetch content until auth is checked

    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        // Handle if data is an error object
        if (Array.isArray(data)) {
          setContents(data)
        } else {
          console.error('Data is not an array:', data)
          setContents([])
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Fetch error:', err)
        setContents([])
        setLoading(false)
      })
  }, [authChecked])

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (window.scrollY / totalHeight) * 100
      setReadProgress(progress)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLike = (id) => {
    setLikes(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }))

    // Crazy animation effect
    const button = document.querySelector(`[data-like="${id}"]`)
    if (button) {
      button.classList.add('animate-bounce')
      setTimeout(() => button.classList.remove('animate-bounce'), 1000)

      // Create floating hearts
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const heart = document.createElement('div')
          heart.innerHTML = '❤️'
          heart.className = 'fixed text-2xl pointer-events-none z-50 animate-ping'
          heart.style.left = Math.random() * 100 + '%'
          heart.style.top = Math.random() * 100 + '%'
          document.body.appendChild(heart)
          setTimeout(() => document.body.removeChild(heart), 1000)
        }, i * 100)
      }
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this content?')) {
      await fetch(`/api/content/${id}`, { method: 'DELETE' })
      setContents(contents.filter(c => c.id !== id))
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      // Force redirect even if API call fails
      router.push('/login')
    }
  }

  const estimateReadingTime = (text) => {
    const wordsPerMinute = 200
    const words = text.split(' ').length
    return Math.ceil(words / wordsPerMinute)
  }

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null

    // Extract video ID from various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`
      }
    }

    return null
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themes[currentTheme]} py-12 px-4 relative overflow-hidden`} ref={containerRef}>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h1 className="font-black text-gray-900 mb-6 tracking-tight leading-none" style={{fontFamily: 'Georgia, serif', fontSize: '100px', fontWeight: 900, letterSpacing: '-0.02em'}}>
            Manage Content
          </h1>
          <p className="text-gray-700 max-w-2xl mx-auto mb-6" style={{fontFamily: 'Palatino Linotype, serif', fontSize: '38px', fontWeight: '400', fontStyle: 'italic', letterSpacing: '1px'}}>
            Voice of Sharavathi - Admin Panel
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/add" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Content
            </Link>
            <Link href="/view" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Public View
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center animate-spin">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-blue-900 mb-2 animate-pulse">Loading Content...</h3>
            <p className="text-gray-700 max-w-md mx-auto">Fetching the latest stories and updates from our database.</p>
          </div>
        ) : contents.length === 0 ? (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center animate-bounce">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-blue-900 mb-2 animate-pulse">No Content Yet</h3>
            <p className="text-gray-700 max-w-md mx-auto mb-6">Start by adding your first content item</p>
            <Link href="/add" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add First Content
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {contents.map((content, index) => (
              <article
                key={content.id}
                className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transform hover:scale-[1.02] transition-all duration-500 group"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="md:flex">
                  {content.contentType === 'image' && (
                      <div className="md:w-1/3 relative overflow-hidden">
                        <img
                          src={content.image}
                          alt={content.title}
                          className="w-full h-64 md:h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      </div>
                    )}

                    {content.contentType === 'video' && (
                      <div className="md:w-1/3 relative overflow-hidden bg-black">
                        {getYouTubeEmbedUrl(content.externalUrl) ? (
                          <iframe
                            width="100%"
                            height="400"
                            src={getYouTubeEmbedUrl(content.externalUrl)}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          ></iframe>
                        ) : (
                          <div className="w-full h-96 bg-gray-900 flex items-center justify-center">
                            <div className="text-center">
                              <svg className="w-16 h-16 text-white mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                              </svg>
                              <p className="text-white text-sm mt-4">Video</p>
                              {content.externalUrl && (
                                <a
                                  href={content.externalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                  </svg>
                                  Watch on YouTube
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {content.contentType === 'post' && (
                      <div className="md:w-1/3 relative overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                        <div className="w-full h-96 flex items-center justify-center p-4">
                          <div className="text-center">
                            <p className="text-gray-600 font-semibold mb-4">Embedded {content.platform || 'Social Media'} Post</p>
                            <a
                              href={content.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M11 3a1 1 0 100 2h3.586L9.293 9.293a1 1 0 000 1.414A1 1 0 1010.707 9.707L14.414 5h-3.414a1 1 0 100-2h5a1 1 0 011 1v5a1 1 0 11-2 0V4a1 1 0 00-1-1h-5z" />
                              </svg>
                              View Post
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                  <div className="md:w-2/3 p-8 relative">
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-gray-700">
                      <svg className="w-4 h-4 inline mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {new Date(content.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      #{index + 1}
                    </div>

                    {/* Management Buttons */}
                    <div className="absolute top-4 right-16 flex space-x-2">
                      <Link
                        href={`/edit/${content.id}`}
                        className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg"
                        title="Edit Content"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(content.id)}
                        className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg"
                        title="Delete Content"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center mb-6">
                      <div className="w-14 h-14 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          Content Creator
                          <span className="ml-2 text-yellow-500">⭐</span>
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(content.createdAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-500">
                      {content.title}
                    </h1>

                    <div className="prose prose-xl max-w-none text-gray-700 leading-relaxed mb-8">
                      {content.description && content.description.split('\n').map((paragraph, i) => (
                        <p key={i} className="mb-4 group-hover:text-gray-800 transition-colors duration-300">
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          data-like={content.id}
                          onClick={() => handleLike(content.id)}
                          className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-all duration-300 transform hover:scale-110"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span className="font-medium">{likes[content.id] || 0}</span>
                        </button>

                        <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-all duration-300 transform hover:scale-110">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                          <span className="font-medium">Share</span>
                        </button>

                        <button className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-all duration-300 transform hover:scale-110">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="font-medium">Comment</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex -space-x-1">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 border-2 border-white animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 ml-2">+{Math.floor(Math.random() * 50) + 10} views</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
