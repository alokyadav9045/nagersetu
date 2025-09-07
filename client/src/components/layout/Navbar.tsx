'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  User, LogOut, Menu, Home, PlusCircle, List, BarChart3, 
  Settings, Shield, Building2, ChevronDown 
} from 'lucide-react'
import AuthModal from '../auth/AuthModal'
import { toast } from 'react-hot-toast'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    getUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user)
        await getUserProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setUserProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) {
      await getUserProfile(user.id)
    }
  }

  const getUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (data) setUserProfile(data)
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Error logging out')
    } else {
      toast.success('Logged out successfully')
      router.push('/')
    }
  }

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Report Issue', href: '/report', icon: PlusCircle, requireAuth: true },
    { name: 'My Issues', href: '/my-issues', icon: List, requireAuth: true },
  ]

  const adminNavigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Manage Issues', href: '/admin/issues', icon: Settings },
  ]

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  const isActivePath = (href: string) => {
    return pathname === href
  }

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-2.5 shadow-lg">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-foreground">Nagersetu</span>
                  <span className="text-xs text-muted-foreground hidden sm:block">Civic Connect Platform</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              <NavigationMenu>
                <NavigationMenuList>
                  {navigation.map((item) => {
                    if (item.requireAuth && !user) return null
                    return (
                      <NavigationMenuItem key={item.name}>
                        <Link 
                          href={item.href}
                          className={cn(
                            navigationMenuTriggerStyle(),
                            "flex items-center space-x-2",
                            isActivePath(item.href) && "bg-accent text-accent-foreground"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      </NavigationMenuItem>
                    )
                  })}

                  {/* Admin Navigation Dropdown */}
                  {userProfile?.role === 'admin' && (
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <span>Admin</span>
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="grid w-48 gap-3 p-4">
                          {adminNavigation.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className={cn(
                                "flex items-center space-x-2 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                isActivePath(item.href) && "bg-accent text-accent-foreground"
                              )}
                            >
                              <item.icon className="h-4 w-4" />
                              <span className="text-sm font-medium">{item.name}</span>
                            </Link>
                          ))}
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  )}
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-auto px-3 space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={userProfile?.full_name || user.email} />
                        <AvatarFallback className="text-xs">
                          {getUserInitials(userProfile?.full_name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">
                          {userProfile?.full_name || user.email?.split('@')[0]}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {userProfile?.role || 'citizen'}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {userProfile?.full_name || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    {userProfile?.role === 'admin' && (
                      <DropdownMenuItem onClick={() => router.push('/admin')}>
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setAuthMode('login')
                      setShowAuthModal(true)
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => {
                      setAuthMode('register')
                      setShowAuthModal(true)
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-2">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="flex items-center space-x-2">
                      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-2">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <span>Nagersetu</span>
                    </SheetTitle>
                    <SheetDescription>
                      Civic Connect Platform
                    </SheetDescription>
                  </SheetHeader>

                  <div className="mt-6">
                    {/* User Info */}
                    {user && (
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {getUserInitials(userProfile?.full_name, user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {userProfile?.full_name || user.email?.split('@')[0]}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {userProfile?.role || 'citizen'}
                          </p>
                        </div>
                      </div>
                    )}

                    <Separator className="my-4" />

                    {/* Navigation Links */}
                    <div className="space-y-1">
                      {navigation.map((item) => {
                        if (item.requireAuth && !user) return null
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                              isActivePath(item.href) && "bg-accent text-accent-foreground"
                            )}
                          >
                            <item.icon className="h-5 w-5" />
                            <span>{item.name}</span>
                          </Link>
                        )
                      })}

                      {/* Admin Links */}
                      {userProfile?.role === 'admin' && (
                        <>
                          <Separator className="my-2" />
                          <div className="px-3 py-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Admin
                            </p>
                          </div>
                          {adminNavigation.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                isActivePath(item.href) && "bg-accent text-accent-foreground"
                              )}
                            >
                              <item.icon className="h-5 w-5" />
                              <span>{item.name}</span>
                            </Link>
                          ))}
                        </>
                      )}
                    </div>

                    <Separator className="my-4" />

                    {/* Auth Buttons */}
                    {user ? (
                      <div className="space-y-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            router.push('/profile')
                            setMobileMenuOpen(false)
                          }}
                        >
                          <User className="mr-2 h-4 w-4" />
                          Profile Settings
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                          onClick={() => {
                            handleLogout()
                            setMobileMenuOpen(false)
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setAuthMode('login')
                            setShowAuthModal(true)
                            setMobileMenuOpen(false)
                          }}
                        >
                          Login
                        </Button>
                        <Button
                          className="w-full"
                          onClick={() => {
                            setAuthMode('register')
                            setShowAuthModal(true)
                            setMobileMenuOpen(false)
                          }}
                        >
                          Sign Up
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  )
}
