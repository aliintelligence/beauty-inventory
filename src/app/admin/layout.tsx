'use client'

import Link from 'next/link'
import GUrlAestheticLogo from '../../../components/GUrlAestheticLogo'
import AdminGuard from '../../components/AdminGuard'
import { AuthProvider, useAuth } from '../../contexts/AuthContext'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <AuthProvider>
      <AdminGuard>
        <AdminContent>{children}</AdminContent>
      </AdminGuard>
    </AuthProvider>
  )
}

function AdminContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <AdminNavbar />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

function AdminNavbar() {
  return (
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
              <Link href="/admin/customers" className="text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium">
                Customers
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
          <AdminUserMenu />
        </div>
      </div>
    </nav>
  )
}

function AdminUserMenu() {
  return (
    <div className="flex items-center space-x-4">
      <Link 
        href="/" 
        className="text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium"
      >
        View Site
      </Link>
      <LogoutButton />
    </div>
  )
}

function LogoutButton() {
  const { logout } = useAuth()

  return (
    <button
      onClick={logout}
      className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
    >
      Logout
    </button>
  )
}