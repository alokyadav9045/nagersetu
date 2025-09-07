"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-black/80 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-white">
              NextTemplate
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/"
                className="text-white hover:text-zinc-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                href="/features"
                className="text-zinc-400 hover:text-zinc-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Features
              </Link>
              <Link
                href="/docs"
                className="text-zinc-400 hover:text-zinc-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Documentation
              </Link>
              <Link
                href="/about"
                className="text-zinc-400 hover:text-zinc-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                About
              </Link>
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-zinc-800 hover:bg-zinc-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black border-t border-zinc-800">
              <Link
                href="/"
                className="text-white hover:text-zinc-300 block px-3 py-2 rounded-md text-base font-medium"
                onClick={toggleMenu}
              >
                Home
              </Link>
              <Link
                href="/features"
                className="text-zinc-400 hover:text-zinc-300 block px-3 py-2 rounded-md text-base font-medium"
                onClick={toggleMenu}
              >
                Features
              </Link>
              <Link
                href="/docs"
                className="text-zinc-400 hover:text-zinc-300 block px-3 py-2 rounded-md text-base font-medium"
                onClick={toggleMenu}
              >
                Documentation
              </Link>
              <Link
                href="/about"
                className="text-zinc-400 hover:text-zinc-300 block px-3 py-2 rounded-md text-base font-medium"
                onClick={toggleMenu}
              >
                About
              </Link>
              <div className="pt-4 pb-3 border-t border-zinc-800">
                <div className="flex items-center space-x-3">
                  <Link href="/login" onClick={toggleMenu}>
                    <Button variant="ghost" size="sm" className="w-full text-zinc-400 hover:text-white hover:bg-zinc-800">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={toggleMenu}>
                    <Button size="sm" className="w-full bg-zinc-800 hover:bg-zinc-700 text-white">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}