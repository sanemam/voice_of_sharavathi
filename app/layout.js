import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Voice of Sharavathi',
  description: 'A website for comunity stories and content',
  viewport: 'width=device-width, initial-scale=1',
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
