'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Instagram, MapPin, Sparkles } from 'lucide-react'
import GUrlAestheticLogo from '../../components/GUrlAestheticLogo'

export default function HomePage() {
  const [showAdminButton, setShowAdminButton] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Hidden Admin Access */}
      <div 
        className="absolute top-4 left-4 w-8 h-8 cursor-pointer"
        onClick={() => setShowAdminButton(!showAdminButton)}
      >
        {showAdminButton && (
          <Link 
            href="/admin"
            className="bg-gray-800 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 transition-colors"
          >
            Admin
          </Link>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Logo/Brand */}
        <div className="mb-8">
          <GUrlAestheticLogo size="xl" showText={false} className="mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Gurl Aesthetic
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Nail Accessories & Girly Beauty Products 🇹🇹
          </p>
        </div>

        {/* Work in Progress Message */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8 text-pink-500 mr-3" />
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
              Coming Soon
            </h2>
            <Sparkles className="h-8 w-8 text-pink-500 ml-3" />
          </div>
          
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            We&apos;re putting the finishing touches on our new website! 
            Get ready for an amazing online shopping experience featuring our 
            premium nail accessories and girly beauty products.
          </p>

          <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">What&apos;s Coming:</h3>
            <ul className="text-gray-700 space-y-2 text-left">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-pink-500 rounded-full mr-3"></div>
                Browse our complete nail accessories catalog
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Easy online ordering system
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-pink-500 rounded-full mr-3"></div>
                Nationwide delivery & free pickup options
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Special deals and girly beauty products
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-6 mb-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-center">🛍️ Ready to Order Now?</h3>
            <p className="text-center text-gray-700 mb-3">
              <strong>DM us on Instagram to place your order!</strong>
            </p>
            <div className="text-sm text-gray-600 text-center space-y-1">
              <p>📲 Nationwide Delivery Available</p>
              <p>🆓 Free Pickup Option</p>
              <p>💅 Nail Accessories & Beauty Products</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 text-center">
            Follow us on Instagram for product updates and to start your haul!
          </p>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto">
          <a 
            href="https://www.instagram.com/gurlaesthetic.tt/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group border-2 border-pink-200"
          >
            <Instagram className="h-8 w-8 text-pink-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 mb-1">DM to Order! 📲</h3>
            <p className="text-gray-600 text-sm">@gurlaesthetic.tt</p>
            <p className="text-xs text-pink-600 mt-1">Tap &apos;Message&apos; to start your haul!</p>
          </a>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <MapPin className="h-8 w-8 text-purple-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Delivery & Pickup</h3>
            <p className="text-gray-600 text-sm">🇹🇹 Nationwide Delivery</p>
            <p className="text-xs text-green-600 mt-1">Free Pickup Available</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            © 2024 Gurl Aesthetic. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}