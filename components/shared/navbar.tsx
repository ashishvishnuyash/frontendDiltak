'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Brain, LogOut, Settings, User as UserIcon, ChevronDown, Menu, X, Bell } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';
import type { User as UserType } from '@/types';

interface NavbarProps {
  user?: UserType;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    // Firebase signout
    const error = await signOut(auth).catch((err) => err);
    if (error) {
      toast.error('Failed to sign out');
    } else {
      toast.success('Signed out successfully');
      router.push('/');
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isEmployeePath = pathname.startsWith('/employee');
  const isEmployerPath = pathname.startsWith('/employer');
  const isManagerPath = pathname.startsWith('/manager');

  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-amber-600 via-lime-600 to-emerald-700 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">D</span>
            </div>
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-lime-600 to-emerald-700">Diltak.ai</span>
          </div>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              {user.role === 'employee' && (
                <>
                  <Link href="/employee/dashboard">
                    <Button variant="ghost" className={`text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2 ${
                      pathname === '/employee/dashboard' ? 'bg-gray-100 dark:bg-gray-800' : ''
                    }`}>
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/employee/chat">
                    <Button variant="ghost" className={`text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2 ${
                      pathname === '/employee/chat' ? 'bg-gray-100 dark:bg-gray-800' : ''
                    }`}>
                      AI Chat
                    </Button>
                  </Link>
                  <Link href="/employee/reports">
                    <Button variant="ghost" className={`text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2 ${
                      pathname === '/employee/reports' ? 'bg-gray-100 dark:bg-gray-800' : ''
                    }`}>
                      Reports
                    </Button>
                  </Link>
                  <Link href="/employee/wellness-hub">
                    <Button variant="ghost" className={`text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2 ${
                      pathname === '/employee/wellness-hub' ? 'bg-gray-100 dark:bg-gray-800' : ''
                    }`}>
                      Wellness
                    </Button>
                  </Link>
                  <Link href="/employee/community">
                    <Button variant="ghost" className={`text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2 ${
                      pathname === '/employee/community' ? 'bg-gray-100 dark:bg-gray-800' : ''
                    }`}>
                      Community
                    </Button>
                  </Link>
                </>
              )}
              
              {user.role === 'manager' && (
                <>
                  <Link href="/manager/dashboard">
                    <Button variant="ghost" className={`text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2 ${
                      pathname === '/manager/dashboard' ? 'bg-gray-100 dark:bg-gray-800' : ''
                    }`}>
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/manager/org-chart">
                    <Button variant="ghost" className={`text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2 ${
                      pathname === '/manager/org-chart' ? 'bg-gray-100 dark:bg-gray-800' : ''
                    }`}>
                      Org Chart
                    </Button>
                  </Link>
                  <Link href="/manager/team-reports">
                    <Button variant="ghost" className={`text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2 ${
                      pathname === '/manager/team-reports' ? 'bg-gray-100 dark:bg-gray-800' : ''
                    }`}>
                      Team Reports
                    </Button>
                  </Link>
                  <Link href="/employee/chat">
                    <Button variant="ghost" className={`text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2 ${
                      pathname === '/employee/chat' ? 'bg-gray-100 dark:bg-gray-800' : ''
                    }`}>
                      AI Chat
                    </Button>
                  </Link>
                </>
              )}

              {user.role === 'employer' && (
                <>
                  <Link href="/employer/dashboard">
                    <Button variant="ghost" className={`text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2 ${
                      pathname === '/employer/dashboard' ? 'bg-gray-100 dark:bg-gray-800' : ''
                    }`}>
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/employer/employees">
                    <Button variant="ghost" className={`text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2 ${
                      pathname.startsWith('/employer/employees') ? 'bg-gray-100 dark:bg-gray-800' : ''
                    }`}>
                      Employees
                    </Button>
                  </Link>
                  <Link href="/employer/reports">
                    <Button variant="ghost" className={`text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2 ${
                      pathname.startsWith('/employer/reports') ? 'bg-gray-100 dark:bg-gray-800' : ''
                    }`}>
                      Reports
                    </Button>
                  </Link>
                  <Link href="/employer/analytics">
                    <Button variant="ghost" className={`text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2 ${
                      pathname === '/employer/analytics' ? 'bg-gray-100 dark:bg-gray-800' : ''
                    }`}>
                      Analytics
                    </Button>
                  </Link>
                </>
              )}

              {/* User Actions */}
              <div className="flex items-center space-x-2 border-l border-gray-200 dark:border-gray-700 pl-4">
                <Button variant="outline" size="sm" className="p-2">
                  <Bell className="h-4 w-4" />
                </Button>
                
                <ThemeToggle size="sm" />

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 px-3"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          )}

          {/* Mobile Navigation - Hamburger Menu */}
          {user && (
            <div className="lg:hidden flex items-center space-x-2">
              <ThemeToggle size="sm" />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          )}

          {/* Non-authenticated User Menu */}
          {!user && (
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2">
                  Login
                </Button>
              </Link>
              <ThemeToggle size="sm" />
            </div>
          )}

          {/* Mobile Menu Dropdown */}
          {user && isMobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg z-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                <div className="flex flex-col space-y-2">
                  {user.role === 'employee' && (
                    <>
                      <Link href="/employee/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3">
                          Dashboard
                        </Button>
                      </Link>
                      <Link href="/employee/chat" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3">
                          AI Chat
                        </Button>
                      </Link>
                      <Link href="/employee/reports" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3">
                          Reports
                        </Button>
                      </Link>
                      <Link href="/employee/wellness-hub" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3">
                          Wellness
                        </Button>
                      </Link>
                      <Link href="/employee/community" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3">
                          Community
                        </Button>
                      </Link>
                    </>
                  )}

                  {user.role === 'manager' && (
                    <>
                      <Link href="/manager/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3">
                          Dashboard
                        </Button>
                      </Link>
                      <Link href="/manager/org-chart" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3">
                          Org Chart
                        </Button>
                      </Link>
                      <Link href="/manager/team-reports" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3">
                          Team Reports
                        </Button>
                      </Link>
                      <Link href="/employee/chat" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3">
                          AI Chat
                        </Button>
                      </Link>
                    </>
                  )}

                  {user.role === 'employer' && (
                    <>
                      <Link href="/employer/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3">
                          Dashboard
                        </Button>
                      </Link>
                      <Link href="/employer/employees" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3">
                          Employees
                        </Button>
                      </Link>
                      <Link href="/employer/reports" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3">
                          Reports
                        </Button>
                      </Link>
                      <Link href="/employer/analytics" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3">
                          Analytics
                        </Button>
                      </Link>
                    </>
                  )}

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                      Welcome, {user.first_name || user.email}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <UserIcon className="h-4 w-4 mr-2" />
                        Profile
                      </Button>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20"
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
