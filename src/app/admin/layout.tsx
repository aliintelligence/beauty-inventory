import Link from 'next/link'
import GUrlAestheticLogo from '../../../components/GUrlAestheticLogo'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/admin" className="flex items-center space-x-3">
                <GUrlAestheticLogo size="sm" showText={false} />
                <span className="text-xl font-semibold text-pink-900">Gurl Aesthetic Admin</span>
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/admin" className="text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/admin/products" className="text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium">
                  Products
                </Link>
                <Link href="/admin/orders" className="text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium">
                  Orders
                </Link>
                <Link href="/admin/analytics" className="text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium">
                  Analytics
                </Link>
                <Link href="/recommendations" className="text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium">
                  AI Recommendations
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium"
              >
                View Site
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}