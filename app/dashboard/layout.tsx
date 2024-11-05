"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  Menu,
  X,
  Bell,
  LogOut,
  Eye,
  BookOpen
} from 'lucide-react'
import { AccessibilityPanel } from '@/components/AccessibilityPanel'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Students', href: '/dashboard/students', icon: Users },
  { name: 'Marks', href: '/dashboard/marks', icon: BookOpen },
  { name: 'Report Cards', href: '/dashboard/report-cards', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [accessibilityOpen, setAccessibilityOpen] = useState(false)
  const pathname = usePathname()

  // Mock user data (replace with actual auth logic later)
  const user = {
    name: 'Root',
    email: 'root@example.com',
    role: 'Administrator',
    avatar: '/placeholder-avatar.jpg'
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen bg-gray-100 overflow-hidden">
        {/* Sidebar for mobile */}
        <div className={`fixed inset-0 z-40 flex md:hidden ${sidebarOpen ? "" : "hidden"}`} role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <Button variant="ghost" size="icon" className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" onClick={() => setSidebarOpen(false)}>
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" aria-hidden="true" />
              </Button>
            </div>
            <ScrollArea className="flex-1 h-0 overflow-y-auto">
              <nav className="px-2 space-y-1">
                {navItems.map((item) => (
                  <NavItem key={item.name} {...item} pathname={pathname} mobile />
                ))}
              </nav>
            </ScrollArea>
          </div>
        </div>

        {/* Static sidebar for desktop */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4">
                  <span className="text-2xl font-semibold">eSomero</span>
                </div>
                <ScrollArea className="mt-5 flex-1 h-0 overflow-y-auto">
                  <nav className="px-2 space-y-1">
                    {navItems.map((item) => (
                      <NavItem key={item.name} {...item} pathname={pathname} />
                    ))}
                  </nav>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <div className="relative z-10 flex-shrink-0 flex h-16 bg-gray-50 shadow">
            <Button variant="ghost" size="icon" className="md:hidden px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500" onClick={() => setSidebarOpen(true)}>
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </Button>
            <div className="flex-1 px-4 flex justify-between">
              <div className="flex-1 flex items-center">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{pathname.split('/').pop()}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className="ml-4 flex items-center md:ml-6">
                <Button variant="ghost" size="icon" className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <span className="sr-only">View notifications</span>
                  <Bell className="h-6 w-6" aria-hidden="true" />
                </Button>
                <Button variant="ghost" size="icon" className="ml-3 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" onClick={() => setAccessibilityOpen(!accessibilityOpen)}>
                  <span className="sr-only">Accessibility options</span>
                  <Eye className="h-6 w-6" aria-hidden="true" />
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
                      <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">{user.name}</span>
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

          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-2">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-4">
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

function NavItem({ name, href, icon: Icon, pathname, mobile }: { name: string, href: string, icon: React.ElementType, pathname: string, mobile?: boolean }) {
  const isActive = pathname === href
  return (
    <Link href={href} className={`${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
      ${mobile ? 'text-base' : 'text-sm'} group flex items-center px-2 py-2 font-medium rounded-md`}>
      <Icon className={`${isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'}
        ${mobile ? 'mr-4 h-6 w-6' : 'mr-3 h-5 w-5'}`} aria-hidden="true" />
      {name}
    </Link>
  )
}