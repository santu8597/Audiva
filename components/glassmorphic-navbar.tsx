'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const GlassmorphicNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Audio', href: '/audio' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ]

  return (
    <nav 
      className={`
        fixed top-4 left-1/2 transform -translate-x-1/2 z-50 
        glassmorphic-nav transition-all duration-500 ease-out
        ${isScrolled 
          ? 'backdrop-blur-xl bg-white/10 shadow-2xl border border-white/20' 
          : 'backdrop-blur-lg bg-white/5 shadow-lg border border-white/10'
        }
      `}
      style={{
        borderRadius: '24px',
        padding: '8px 12px',
        background: isScrolled 
          ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)'
      }}
    >
      <div className="flex items-center space-x-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                relative px-4 py-2 rounded-full text-sm font-medium
                nav-link-glow transition-all duration-300 ease-out
                hover:scale-105 hover:shadow-lg
                group overflow-hidden
                ${isActive 
                  ? 'text-white bg-white/20 shadow-inner' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
                }
              `}
            >
              {/* Hover animation background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 ease-out" />
              
              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
              </div>
              
              {/* Text content */}
              <span className="relative z-10 transition-all duration-300 group-hover:drop-shadow-sm">
                {item.name}
              </span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-pulse" />
              )}
              
              {/* Ripple effect on click */}
              <div className="absolute inset-0 rounded-full opacity-0 group-active:opacity-20 bg-white transition-opacity duration-150" />
            </Link>
          )
        })}
      </div>
      
      {/* Floating glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500 -z-10" />
    </nav>
  )
}

export default GlassmorphicNavbar
