import './globals.css'
import Link from 'next/link'
export const metadataBase = new URL('https://voice-of-sharavathi.vercel.app');

export const metadata = {
  title: 'Voice of Sharavathi',
  description: 'Discover inspiring stories about river conservation and sustainable living. Join our mission to protect and restore our precious waterways.',
  keywords: 'river conservation, Sharavathi, environment, sustainability, water protection',
  authors: [{ name: 'Voice of Sharavathi Team' }],
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'Voice of Sharavathi - River Conservation Stories',
    description: 'Discover inspiring stories about river conservation and sustainable living. Join our mission to protect and restore our precious waterways.',
    url: 'https://voice-of-sharavathi.vercel.app',
    siteName: 'Voice of Sharavathi',
    images: [
      {
        url: '/og-image.jpg', // You'll need to add this image
        width: 1200,
        height: 630,
        alt: 'Voice of Sharavathi - River Conservation',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Voice of Sharavathi - River Conservation Stories',
    description: 'Discover inspiring stories about river conservation and sustainable living.',
    images: ['/og-image.jpg'], // You'll need to add this image
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gray-100">
        <nav className="bg-white shadow-md p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex flex-wrap gap-2 md:gap-4">
              <Link href="/" className="text-gray-600 hover:text-gray-800 text-sm md:text-base px-2 py-1 md:px-3 md:py-2 rounded hover:bg-gray-100 transition-colors">
                Manage
              </Link>
              <Link href="/add" className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm md:text-base transition-colors">
                Add Content
              </Link>
              <Link href="/view" className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 text-sm md:text-base transition-colors">
                Public View
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  )
}
