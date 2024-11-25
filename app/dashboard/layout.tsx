"use client"

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { LayoutDashboard, Users, FileText, Settings, Menu, X, Bell, LogOut, Eye, BookOpen, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { AccessibilityPanel } from '@/components/AccessibilityPanel'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Students', href: '/dashboard/students', icon: Users },
  { name: 'Marks', href: '/dashboard/marks', icon: BookOpen },
  { name: 'Report Cards', href: '/dashboard/report-cards', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

interface NavItemProps {
  name: string
  href: string
  icon: React.ElementType
  isActive: boolean
  isCollapsed: boolean
}

function NavItem({ name, href, icon: Icon, isActive, isCollapsed }: NavItemProps) {
  return (
    <Link href={href} passHref>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start",
          isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground",
          isCollapsed ? "px-2" : "px-4"
        )}
      >
        <Icon className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-2")} />
        {!isCollapsed && <span>{name}</span>}
      </Button>
    </Link>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [accessibilityOpen, setAccessibilityOpen] = useState(false)
  const pathname = usePathname()

  // Mock user data (replace with actual auth logic later)
  const user = {
    name: 'Loyola SS - Wau',
    email: 'loyolass@gmail.com',
    role: 'Administrator',
    avatar: '/LoyolaLogoOrig.png'
  }

  // New function to generate breadcrumb items
  const breadcrumbItems = useMemo(() => {
    const pathSegments = pathname.split('/').filter(segment => segment)
    const items = pathSegments.map((segment, index) => {
      const path = `/${pathSegments.slice(0, index + 1).join('/')}`
      let label = segment.charAt(0).toUpperCase() + segment.slice(1)
      
      // Map segment to more readable names
      switch (segment) {
        case 'dashboard':
          label = 'Dashboard'
          break
        case 'report-cards':
          label = 'Report Cards'
          break
        case 'students':
          label = 'Students'
          break
        case 'marks':
          label = 'Marks'
          break
        case 'settings':
          label = 'Settings'
          break
        default:
          // If it's an ID (like in report-cards/[id]), keep it as is
          break
      }

      return { path, label }
    })

    return items
  }, [pathname])

  const SideNav = ({ isMobile = false }) => (
    <div className={cn(
      "flex flex-col h-full bg-background border-r print:hidden transition-all duration-300",
      isMobile ? "w-64" : (isCollapsed ? "w-[70px]" : "w-64")
    )}>
      <div className="flex items-center justify-between p-4">
        {(!isCollapsed || isMobile) && (
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
            eSomero
          </span>
        )}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>
      <Separator />
      <div className="flex-1 flex flex-col min-h-0">
        {(!isCollapsed || isMobile) && (
          <div className="px-4 py-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search" className="pl-8" />
            </div>
          </div>
        )}
        <ScrollArea className="flex-1 px-3">
          <nav className="flex flex-col gap-1 py-2">
            {navItems.map((item) => (
              <NavItem
                key={item.name}
                isActive={pathname === item.href}
                isCollapsed={isCollapsed && !isMobile}
                {...item}
              />
            ))}
          </nav>
        </ScrollArea>
      </div>
      <Separator />
      <div className="p-4">
        <Button variant="ghost" className="w-full justify-start">
          <LogOut className={cn("h-5 w-5", isCollapsed && !isMobile ? "mr-0" : "mr-2")} />
          {(!isCollapsed || isMobile) && <span>Logout</span>}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar for mobile */}
        <div className={`fixed inset-0 z-40 md:hidden print:hidden ${sidebarOpen ? "" : "hidden"}`} role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" aria-hidden="true" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-background">
            <div className="absolute right-0 top-0 flex w-16 justify-center pt-5">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6" />
                <span className="sr-only">Close sidebar</span>
              </Button>
            </div>
            <SideNav isMobile />
          </div>
        </div>

        {/* Static sidebar for desktop */}
        <div className="hidden md:flex md:flex-shrink-0 print:hidden">
          <SideNav />
        </div>

        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <div className="relative z-10 flex h-16 flex-shrink-0 border-b bg-background print:hidden">
            <Button variant="ghost" size="icon" className="px-4 border-r md:hidden" onClick={() => setSidebarOpen(true)}>
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </Button>
            <div className="flex flex-1 justify-between px-4">
              <div className="flex flex-1 items-center">
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbItems.map((item, index) => (
                    <BreadcrumbItem key={item.path}>
                      {index === breadcrumbItems.length - 1 ? (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      ) : (
                        <>
                          <BreadcrumbLink href={item.path}>{item.label}</BreadcrumbLink>
                          <BreadcrumbSeparator />
                        </>
                      )}
                    </BreadcrumbItem>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
              </div>
              <div className="ml-4 flex items-center md:ml-6">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">View notifications</span>
                </Button>
                <Button variant="ghost" size="icon" className="ml-3 rounded-full" onClick={() => setAccessibilityOpen(!accessibilityOpen)}>
                  <Eye className="h-5 w-5" />
                  <span className="sr-only">Accessibility options</span>
                </Button>

                {/* Profile dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="ml-3 flex items-center">
                      <span className="sr-only">Open user menu</span>
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="ml-2 text-sm font-medium hidden md:block">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                    <DropdownMenuItem>{user.email}</DropdownMenuItem>
                    <DropdownMenuItem>{user.role}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <main className="flex-1 overflow-y-auto">
            <div className="py-6">
              <div className="sm:mx-2 md:mx-auto max-w-full md:max-w-7xl md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
      <AccessibilityPanel open={accessibilityOpen} setOpen={setAccessibilityOpen} />
    </div>
  )
}