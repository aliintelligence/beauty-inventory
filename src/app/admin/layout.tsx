'use client'

import Link from 'next/link'
import { useAuth } from '../../../components/AuthProvider'
import { useEffect, useState } from 'react'
import LoginForm from '../../../components/LoginForm'
import GUrlAestheticLogo from '../../../components/GUrlAestheticLogo'
import { LogOut } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, logout } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm />
  }

  const handleLogout = () => {
    logout()
  }

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
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium"
              >
                View Site
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium flex items-center space-x-1"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
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