import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'CMS Website',
  description: 'A basic content management system',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <nav className="bg-white shadow-md p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-gray-800">CMS Admin</Link>
            <div className="space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-800">Manage</Link>
              <Link href="/add" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Add Content</Link>
              <Link href="/view" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Public View</Link>
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  )
}
