import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Beauty Inventory Tracker",
  description: "Track your beauty product inventory and sales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-pink-50 min-h-screen`}
      >
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link href="/" className="text-xl font-semibold text-pink-900">
                  💄 Beauty Inventory
                </Link>
                <div className="hidden md:flex space-x-6">
                  <Link href="/" className="text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium">
                    Dashboard
                  </Link>
                  <Link href="/products" className="text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium">
                    Products
                  </Link>
                  <Link href="/orders" className="text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium">
                    Orders
                  </Link>
                  <Link href="/analytics" className="text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium">
                    Analytics
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
