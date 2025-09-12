'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Menu, Bell, Search, User, LogOut, Settings, 
  BarChart3, Users, Shield, Home, FileText, Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'react-hot-toast'

interface AdminNavbarProps {
  className?: string
}

export function AdminNavbar({ className = '' }: AdminNavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [notifications, setNotifications] = useState(3) // Mock notification count
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } catch {}
    localStorage.removeItem('nagarsetu_admin_session')
    toast.success('Logged out successfully')
    router.push('/')
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Issues', href: '/admin/issues', icon: FileText },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Logs', href: '/admin/logs', icon: Activity },
  ]

  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 ${className}`}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                Nagarsetu Admin
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      pathname === item.href
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </a>
                )
              })}
            </nav>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 w-64"
                />
              </div>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-auto px-3 space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/admin.png" alt="Admin" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">Admin User</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Admin User</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      admin@nagarsetu.gov.in
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/admin')}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/admin/users')}>
                  <Users className="mr-2 h-4 w-4" />
                  User Management
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`block pl-3 pr-4 py-2 text-base font-medium ${
                      pathname === item.href
                        ? 'bg-blue-50 border-r-4 border-blue-500 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
