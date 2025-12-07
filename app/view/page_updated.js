'use client'

import { useEffect, useState, useRef } from 'react'

export default function PublicView() {
  const [contents, setContents] = useState([])
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
      })
      .catch(err => {
        console.error('Fetch error:', err)
        setContents([])
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
            Gallery
          </h1>
          <p className="text-gray-700 text-lg max-w-2xl mx-auto">
            Discover inspiring content from our community. Each post tells a story about river conservation and sustainable living.
          </p>
        </div>

        {/* Share Modal */}
        {showShareModal && shareContent && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Share</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mb-8 font-medium">&ldquo;{shareContent.title}&rdquo;</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Twitter', icon: '𝕏', fn: 'twitter', color: 'bg-black text-white' },
                  { name: 'Facebook', icon: 'f', fn: 'facebook', color: 'bg-blue-600 text-white' },
                  { name: 'LinkedIn', icon: 'in', fn: 'linkedin', color: 'bg-blue-700 text-white' },
                  { name: 'WhatsApp', icon: '💬', fn: 'whatsapp', color: 'bg-green-500 text-white' }
                ].map(social => (
                  <button
                    key={social.fn}
                    onClick={() => shareToSocial(social.fn)}
                    className={`${social.color} py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity`}
                  >
                    {social.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {contents.length === 0 ? (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center animate-bounce">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-blue-900 mb-2 animate-pulse">Content Coming Soon</h3>
            <p className="text-gray-700 max-w-md mx-auto">We're gathering powerful stories and evidence about river conservation. Stay tuned as we share important updates on our mission to protect and restore our rivers. 🌊</p>
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
                        {content.externalUrl && content.externalUrl.includes('youtube') ? (
                          <iframe
                            width="100%"
                            height="400"
                            src={content.externalUrl.replace('watch?v=', 'embed/').split('&')[0]}
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
                    {/* Post Number Badge */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-full text-xs font-bold">
                      #{index + 1}
                    </div>

                    {/* Author Section with Explicit Labels */}
                    <div className="flex items-start mb-8 pb-6 border-b border-gray-200">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        {/* Author Name */}
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          Posted By
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          Content Creator
                          <span className="ml-2 text-yellow-500">⭐</span>
                        </h3>

                        {/* Posted On - Full Timestamp */}
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600 flex items-center">
                            <svg className="w-4 h-4 mr-1 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <strong>Posted on:</strong>&nbsp;
                            <span className="font-medium">
                              {new Date(content.createdAt).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </p>

                          {/* Updated At - Only Show if Different */}
                          {content.updatedAt && content.updatedAt !== content.createdAt && (
                            <p className="text-xs text-gray-500 flex items-center">
                              <svg className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                              </svg>
                              <em>Last updated:</em>&nbsp;
                              <span className="font-medium">
                                {new Date(content.updatedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content Type & Platform */}
                    <div className="mb-6 pb-6 border-b border-gray-200">
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <div className="w-1 h-5 bg-blue-500 rounded-full mr-3"></div>
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Content Type</div>
                        </div>
                        <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full capitalize ml-4">
                          {content.contentType || 'Post'}
                        </span>
                        {content.platform && (
                          <>
                            <div className="flex items-center mt-2">
                              <div className="w-1 h-5 bg-purple-500 rounded-full mr-3"></div>
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Platform</div>
                            </div>
                            <span className="inline-block bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full capitalize ml-4">
                              {content.platform}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <div className="mb-6">
                      <div className="flex items-center mb-2">
                        <div className="w-1 h-6 bg-gray-900 rounded-full mr-3"></div>
                        <h1 className="text-4xl font-bold text-gray-900 leading-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-500 flex-1">
                          {content.title}
                        </h1>
                      </div>
                    </div>

                    {/* Description */}
                    {content.description && (
                      <div className="mb-8">
                        <div className="flex items-center mb-4">
                          <div className="w-1 h-5 bg-gray-600 rounded-full mr-3"></div>
                          <div className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Description</div>
                        </div>
                        <div className="prose prose-xl max-w-none text-gray-700 leading-relaxed">
                          {content.description.split('\n').map((paragraph, i) => (
                            <p key={i} className="mb-4 group-hover:text-gray-800 transition-colors duration-300">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
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
    </div>
  )
}
