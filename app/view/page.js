'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'

export default function PublicView() {
  const [contents, setContents] = useState([])
  const [loading, setLoading] = useState(true)
  const [likes, setLikes] = useState({})
  const [readProgress, setReadProgress] = useState(0)
  const [currentTheme, setCurrentTheme] = useState('blue')
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareContent, setShareContent] = useState(null)
  const containerRef = useRef(null)

  const themes = {
    blue: 'from-blue-50 to-indigo-100',
    purple: 'from-purple-50 to-pink-100',

    green: 'from-green-50 to-emerald-100',
    orange: 'from-orange-50 to-red-100'
  }

  useEffect(() => {
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
  }, [])

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

  const handleShare = (content) => {
    setShareContent(content)
    setShowShareModal(true)

    // Change theme randomly on share
    const themeKeys = Object.keys(themes)
    const randomTheme = themeKeys[Math.floor(Math.random() * themeKeys.length)]
    setCurrentTheme(randomTheme)
  }

  const shareToSocial = (platform) => {
    const url = window.location.href
    const text = `Check out this amazing content: ${shareContent.title}`

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
    }

    window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    setShowShareModal(false)
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
            Voice of Sharavathi
          </h1>
          <p className="text-gray-700 max-w-2xl mx-auto mb-6" style={{fontFamily: 'Palatino Linotype, serif', fontSize: '38px', fontWeight: '400', fontStyle: 'italic', letterSpacing: '1px'}}>
            One river. One responsibility.
          </p>
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
            <h3 className="text-2xl font-semibold text-blue-900 mb-2 animate-pulse">Content Coming Soon</h3>
            <p className="text-gray-700 max-w-md mx-auto">We are gathering powerful stories and evidence about river conservation. Stay tuned as we share important updates on our mission to protect and restore our rivers. 🌊</p>
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
                        <Image
                          src={content.image}
                          alt={content.title}
                          width={400}
                          height={300}
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

                        <button
                          onClick={() => handleShare(content)}
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-all duration-300 transform hover:scale-110"
                        >
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

      {/* Share Modal */}
      {showShareModal && shareContent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 transform animate-bounce-in">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Share This Amazing Content! 🎉</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => shareToSocial('twitter')}
                className="flex items-center justify-center space-x-2 bg-blue-500 text-white py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                <span>Twitter</span>
              </button>
              <button
                onClick={() => shareToSocial('facebook')}
                className="flex items-center justify-center space-x-2 bg-blue-700 text-white py-3 px-4 rounded-xl hover:bg-blue-800 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </button>
              <button
                onClick={() => shareToSocial('linkedin')}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>LinkedIn</span>
              </button>
              <button
                onClick={() => shareToSocial('whatsapp')}
                className="flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                <span>WhatsApp</span>
              </button>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors duration-200 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
