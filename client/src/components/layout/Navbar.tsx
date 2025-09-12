'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  User, LogOut, Menu, Home, PlusCircle, List, BarChart3,
  Settings, Shield, ChevronDown, Search, Globe
} from 'lucide-react'
// Auth handled via dedicated routes now
import { toast } from 'react-hot-toast'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

function GovSeal() {
  return (
    <span aria-hidden className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-inner">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      </svg>
    </span>
  )
}

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  // Removed modal-based auth; using route-based pages
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    void getUser()
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
    if (user) await getUserProfile(user.id)
  }

  const getUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .limit(1)
    if (data && data.length > 0) setUserProfile(data[0])
  }

  const handleLogout = async () => {
    try { await fetch('/api/admin/logout', { method: 'POST' }) } catch {}
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Error logging out')
    } else {
      toast.success('Logged out successfully')
      router.push('/')
    }
  }

  const navPrimary = useMemo(() => ([
    { name: 'Home', href: '/', icon: Home },
    { name: 'Report Issue', href: '/report', icon: PlusCircle, requireAuth: true },
    { name: 'My Issues', href: '/my-issues', icon: List, requireAuth: true },
    { name: 'Guidelines', href: '/guidelines' },
    { name: 'Statistics', href: '/statistics' },
    { name: 'Contact', href: '/contact' },
  ]), [])

  const adminNav = useMemo(() => ([
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Manage Issues', href: '/admin/issues', icon: Settings },
  ]), [])

  const getUserInitials = (name?: string, email?: string) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    if (email) return email.substring(0, 2).toUpperCase()
    return 'U'
  }

  const isActive = (href: string) => pathname === href

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5" />
            <span>Government Service Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/help" className="hover:underline">Help</Link>
            <Link href="/accessibility" className="hover:underline">Accessibility</Link>
            <span className="rounded px-2 py-0.5 text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-sm">Beta</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <GovSeal />
            <div className="leading-tight">
              <p className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Nagarsetu</p>
              <p className="text-[11px] text-muted-foreground">Civic Services & Complaints Portal</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <Input placeholder="Search services, issues..." className="w-72 pl-9" />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {user && (
              <Button
                onClick={() => router.push('/report')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Report
              </Button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 px-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={userProfile?.full_name || user.email} />
                      <AvatarFallback className="text-xs">
                        {getUserInitials(userProfile?.full_name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{userProfile?.full_name || 'User'}</span>
                      <span className="text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  {userProfile?.role === 'admin' && (
                    <DropdownMenuItem onClick={() => router.push('/admin')}>
                      <Shield className="mr-2 h-4 w-4" /> Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/login')}
                >
                  Login
                </Button>
                <Button
                  onClick={() => router.push('/signup')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90"
                >
                  Sign Up
                </Button>
              </div>
            )}
            <div className="md:hidden" />
          </div>

          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <GovSeal />
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Nagarsetu</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-5">
                  {user && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-accent">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {getUserInitials(userProfile?.full_name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{userProfile?.full_name || user.email?.split('@')[0]}</p>
                        <p className="text-xs text-muted-foreground capitalize">{userProfile?.role || 'citizen'}</p>
                      </div>
                    </div>
                  )}

                  <Separator className="my-4" />

                  <nav className="space-y-1">
                    {navPrimary.map((item) => {
                      const Icon = (item as any).icon
                      if ((item as any).requireAuth && !user) return null
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent',
                            isActive(item.href) && 'bg-accent'
                          )}
                        >
                          {Icon ? <Icon className="h-5 w-5" /> : null}
                          <span>{item.name}</span>
                        </Link>
                      )
                    })}

                    {userProfile?.role === 'admin' && (
                      <>
                        <Separator className="my-2" />
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin</div>
                        {adminNav.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent',
                              isActive(item.href) && 'bg-accent'
                            )}
                          >
                            <item.icon className="h-5 w-5" />
                            <span>{item.name}</span>
                          </Link>
                        ))}
                      </>
                    )}
                  </nav>

                  <Separator className="my-4" />

                  {user ? (
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => { router.push('/profile'); setMobileMenuOpen(false) }}
                      >
                        <User className="mr-2 h-4 w-4" /> Profile Settings
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                        onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Log out
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => { router.push('/login'); setMobileMenuOpen(false) }}
                      >
                        Login
                      </Button>
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90"
                        onClick={() => { router.push('/signup'); setMobileMenuOpen(false) }}
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

      <div className="hidden md:block border-t border-border bg-background/95">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-11 flex items-center justify-between">
          <NavigationMenu>
            <NavigationMenuList>
              {navPrimary.map((item) => {
                const Icon = (item as any).icon
                if ((item as any).requireAuth && !user) return null
                return (
                  <NavigationMenuItem key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        'flex items-center gap-2',
                        isActive(item.href)
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : ''
                      )}
                    >
                      {Icon ? <Icon className="h-4 w-4" /> : null}
                      <span>{item.name}</span>
                    </Link>
                  </NavigationMenuItem>
                )
              })}
            </NavigationMenuList>
          </NavigationMenu>

          {userProfile?.role === 'admin' && (
            <div className="flex items-center gap-2">
              {adminNav.map((item) => (
                <Button key={item.name} variant="outline" size="sm" onClick={() => router.push(item.href)}>
                  <item.icon className="mr-2 h-4 w-4" /> {item.name}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal removed: login/signup now handled by route pages */}
    </header>
  )
}
