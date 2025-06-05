'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Instagram, MapPin, Sparkles } from 'lucide-react'

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
          <div className="mx-auto w-32 h-32 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <span className="text-6xl">💅</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Gurl Aesthetic
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Professional Nail Art & Beauty Services
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
            Get ready for an amazing online experience featuring our 
            premium nail art services and beauty products.
          </p>

          <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">What&apos;s Coming:</h3>
            <ul className="text-gray-700 space-y-2 text-left">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-pink-500 rounded-full mr-3"></div>
                Online booking for nail art appointments
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Browse our complete product catalog
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-pink-500 rounded-full mr-3"></div>
                Gallery of our latest nail art designs
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Special offers and promotions
              </li>
            </ul>
          </div>

          <p className="text-sm text-gray-600">
            In the meantime, follow us on Instagram for the latest updates!
          </p>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto">
          <a 
            href="https://www.instagram.com/gurlaesthetic.tt/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group"
          >
            <Instagram className="h-8 w-8 text-pink-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 mb-1">Follow Us</h3>
            <p className="text-gray-600 text-sm">@gurlaesthetic.tt</p>
          </a>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <MapPin className="h-8 w-8 text-purple-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
            <p className="text-gray-600 text-sm">Trinidad & Tobago</p>
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