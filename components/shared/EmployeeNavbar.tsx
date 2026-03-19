'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';
import {
  Menu,
  X,
  LogOut,
  Bell,
  User,
  LayoutDashboard,
  MessageSquare,
  FileText,
  Heart,
  Users,
  HelpCircle,
  Sparkles,
  Trophy,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface EmployeeNavbarProps {
  user?: {
    first_name?: string;
    last_name?: string;
    email: string;
    role?: string;
    company_name?: string;
  };
  onNavigate?: () => void; // Callback to close avatar before navigation
}

export default function EmployeeNavbar({ user, onNavigate }: EmployeeNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(); // Close avatar first
    }
    setTimeout(() => {
      router.push(path);
    }, 100); // Small delay to ensure avatar closes first
  };

  const handleSignOut = async () => {
    if (onNavigate) {
      onNavigate(); // Close avatar first
    }
    // Firebase signout
    const error = await signOut(auth).catch((err) => err);
    if (error) {
      toast.error('Failed to sign out');
    } else {
      toast.success('Signed out successfully');
      router.push('/');
    }
  };

  const navigationItems = [
    { path: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'blue' },
    { path: '/employee/chat', label: 'AI Chat', icon: MessageSquare, color: 'green' },
    { path: '/employee/reports', label: 'Reports', icon: FileText, color: 'purple' },
    { path: '/employee/wellness-hub', label: 'Wellness', icon: Heart, color: 'teal' },
    { path: '/employee/community', label: 'Community', icon: Users, color: 'orange' },
    { path: '/employee/support', label: 'Support', icon: HelpCircle, color: 'red' },
    { path: '/employee/recommendations', label: 'Recommendations', icon: Sparkles, color: 'indigo' },
    { path: '/employee/gamification', label: 'Gamification', icon: Trophy, color: 'yellow' },
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors: Record<string, { hover: string; active: string; text: string }> = {
      blue: {
        hover: 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30',
        active: 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 text-blue-700 dark:text-blue-300',
        text: 'text-gray-700 dark:text-gray-300'
      },
      green: {
        hover: 'hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30',
        active: 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 text-green-700 dark:text-green-300',
        text: 'text-gray-700 dark:text-gray-300'
      },
      purple: {
        hover: 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 dark:hover:from-purple-900/30 dark:hover:to-violet-900/30',
        active: 'bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/40 dark:to-violet-900/40 text-purple-700 dark:text-purple-300',
        text: 'text-gray-700 dark:text-gray-300'
      },
      teal: {
        hover: 'hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 dark:hover:from-teal-900/30 dark:hover:to-cyan-900/30',
        active: 'bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900/40 dark:to-cyan-900/40 text-teal-700 dark:text-teal-300',
        text: 'text-gray-700 dark:text-gray-300'
      },
      orange: {
        hover: 'hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 dark:hover:from-orange-900/30 dark:hover:to-amber-900/30',
        active: 'bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 text-orange-700 dark:text-orange-300',
        text: 'text-gray-700 dark:text-gray-300'
      },
      red: {
        hover: 'hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/30 dark:hover:to-pink-900/30',
        active: 'bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/40 dark:to-pink-900/40 text-red-700 dark:text-red-300',
        text: 'text-gray-700 dark:text-gray-300'
      },
      indigo: {
        hover: 'hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30',
        active: 'bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-700 dark:text-indigo-300',
        text: 'text-gray-700 dark:text-gray-300'
      },
      yellow: {
        hover: 'hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-900/30 dark:hover:to-orange-900/30',
        active: 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/40 text-yellow-700 dark:text-yellow-300',
        text: 'text-gray-700 dark:text-gray-300'
      },
    };
    const colorClass = colors[color] || colors.blue;
    return isActive ? `${colorClass.active} shadow-sm` : `${colorClass.text} ${colorClass.hover}`;
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden border-b border-gray-200/60 dark:border-gray-700/60 bg-white/98 dark:bg-gray-900/98 backdrop-blur-md sticky top-0 z-50 transition-all duration-300 shadow-sm">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-500 via-lime-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xs sm:text-sm drop-shadow-sm">D</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-lime-600 to-emerald-700">Diltak.ai</span>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle size="sm" />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white/98 dark:bg-gray-900/98 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-700/60 shadow-xl z-50 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-4 sm:px-6 py-4">
              <div className="flex flex-col space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <Button
                      key={item.path}
                      variant="ghost"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleNavigation(item.path);
                      }}
                      className={`w-full justify-start ${getColorClasses(item.color, isActive)} py-3 rounded-lg font-medium transition-all duration-200`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {item.label}
                    </Button>
                  );
                })}

                <div className="pt-4 border-t border-gray-200/60 dark:border-gray-700/60 space-y-3">
                  {user && (
                    <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg">
                      Welcome, {user.first_name || user.email}
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:border-blue-700">
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-gray-800 dark:hover:border-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:bg-gradient-to-r dark:hover:from-red-950/20 dark:hover:to-pink-950/20 hover:border-red-300 dark:hover:border-red-600 font-medium transition-all duration-200"
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
      </header>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex fixed left-0 top-0 h-screen bg-white/98 dark:bg-gray-900/98 backdrop-blur-md border-r border-gray-200/60 dark:border-gray-700/60 transition-all duration-300 z-50 flex-col ${isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}>
        {/* Logo Section */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/60 dark:border-gray-700/60">
          {!isSidebarCollapsed && (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 via-lime-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm drop-shadow-sm">D</span>
              </div>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-lime-600 to-emerald-700">Diltak.ai</span>
            </div>
          )}
          {isSidebarCollapsed && (
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 via-lime-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg mx-auto">
              <span className="text-white font-bold text-sm drop-shadow-sm">D</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            )}
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="flex flex-col space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full justify-start ${getColorClasses(item.color, isActive)} py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-sm ${isSidebarCollapsed ? 'px-2 justify-center' : 'px-3'
                    }`}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <Icon className={`h-4 w-4 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
                  {!isSidebarCollapsed && item.label}
                </Button>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-gray-200/60 dark:border-gray-700/60 p-4 space-y-2">
          {user && !isSidebarCollapsed && (
            <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg mb-2">
              Welcome, {user.first_name || user.email}
            </div>
          )}

          <div className={`flex ${isSidebarCollapsed ? 'flex-col space-y-2' : 'space-x-2'}`}>
            <Button
              variant="outline"
              size="sm"
              className={`hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:border-blue-700 transition-all duration-200 ${isSidebarCollapsed ? 'w-full justify-center px-2' : 'flex-1'
                }`}
              title={isSidebarCollapsed ? 'Notifications' : undefined}
            >
              <Bell className="h-4 w-4" />
              {!isSidebarCollapsed && <span className="ml-2">Notifications</span>}
            </Button>

            <ThemeToggle size="sm" className={isSidebarCollapsed ? 'w-full' : ''} />
          </div>

          <Button
            variant="outline"
            className={`w-full text-red-600 border-red-200 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:bg-gradient-to-r dark:hover:from-red-950/20 dark:hover:to-pink-950/20 hover:border-red-300 dark:hover:border-red-600 font-medium transition-all duration-200 ${isSidebarCollapsed ? 'px-2 justify-center' : 'px-3'
              }`}
            onClick={handleSignOut}
            title={isSidebarCollapsed ? 'Logout' : undefined}
          >
            <LogOut className={`h-4 w-4 ${isSidebarCollapsed ? '' : 'mr-2'}`} />
            {!isSidebarCollapsed && 'Logout'}
          </Button>
        </div>
      </aside>
    </>
  );
}