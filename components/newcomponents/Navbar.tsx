'use client';

import { memo, useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';
import { Menu, X, LogOut, Bell, Settings, Sun, Moon, MenuIcon, LayoutDashboard } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';
import type { NavItem } from './Sidebar';

export interface NavbarUser {
  first_name?: string;
  last_name?: string;
  email: string;
  role?: string;
}

export interface NavbarProps {
  user?: NavbarUser;
  items?: NavItem[];
  onNavigate?: () => void;
  className?: string;
  /** Page title shown in the top bar (desktop) */
  pageTitle?: string;
  pageSubtitle?: string;
}

// ─── Desktop top bar (shown alongside sidebar) ────────────────────────────────

export function DesktopTopBar({
  user,
  pageTitle,
  pageSubtitle,
  className,
}: {
  user?: NavbarUser;
  pageTitle?: string;
  pageSubtitle?: string;
  className?: string;
}) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
   const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  console.log("theme" , theme);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = useCallback(async () => {
    setProfileOpen(false);
    try {
      await signOut(auth);
      toast.success('Signed out');
      router.push('/');
    } catch {
      toast.error('Failed to sign out');
    }
  }, [router]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [profileOpen]);

  const initials = user?.first_name
    ? `${user.first_name[0]}${user.last_name?.[0] ?? ''}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?';

  const displayName = user?.first_name
    ? `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`
    : user?.email ?? 'User';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const themeOptions = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
  ];

  const quotes = [
    '"Take a moment to breathe. Small pauses create stronger days."',
    '"Your wellbeing matters. One step at a time."',
    '"Progress, not perfection. You\'re doing great."',
    '"A healthy mind leads to a productive day."',
  ];
  const dailyQuote = quotes[new Date().getDay() % quotes.length];

  return (
    <header className={cn(
      'hidden lg:flex items-center justify-between',
      'px-6 py-3 border-b border-gray-100 dark:border-gray-800',
      'bg-white dark:bg-gray-900 sticky top-0 z-40',
      className
    )}>
      {/* Left: greeting + quote */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
          <span className="text-sm">🌿</span>
        </div>
        <div>
          <p className="text-base font-bold text-gray-900 dark:text-white">
            {greeting}{user?.first_name ? `, ${user.first_name}` : ''}
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 italic">
            {dailyQuote}
          </p>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">

        {/* Menu */}
          <button
          className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="menu"
        >
          <LayoutDashboard className="h-5 w-5" />
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>

        {/* Profile button + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(v => !v)}
            aria-label="Profile menu"
            aria-expanded={profileOpen}
            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center ring-2 ring-transparent hover:ring-violet-300 dark:hover:ring-violet-700 transition-all">
              <span className="text-[10px] font-semibold text-violet-700 dark:text-violet-300">{initials}</span>
            </div>
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden z-50 p-3">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
                    Hello, {user?.first_name ?? 'User'}
                  </p>
                  {user?.email && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                  )}
                </div>
                <button
                  onClick={() => setProfileOpen(false)}
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0 ml-2"
                  aria-label="Close"
                >
                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Menu items */}
              <div className="py-2">
                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Settings className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <span className="font-medium">Settings</span>
                </Link>

                {/* Theme submenu */}
                {/* <div className="px-4 py-3 border-t border-gray-50 dark:border-gray-800">

                  <button className="flex items-center gap-3 mb-3"  onClick={() => {
if(theme && theme === "light") {
  setTheme("light");
} else {
  setTheme("dark");
}
                  } 
                  }>
                    {theme === "light" ? 
                    <Sun className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    :
                                    <Moon className="h-5 w-5" />
                     }

                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
                  </button>
                </div> */}

                     <div className="px-4 py-3 border-t border-gray-50 dark:border-gray-800">
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between gap-3 px-0 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {theme === 'light' ? (
                        <Sun className="h-5 w-5 text-amber-500" />
                      ) : (
                        <Moon className="h-5 w-5 text-indigo-400" />
                      )}
                      <span>Theme</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {theme === 'light' ? 'Light' : 'Dark'}
                      </span>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-gray-200 dark:bg-gray-700">
                        <span
                          className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                            theme === 'dark' ? "translate-x-6" : "translate-x-1"
                          )}
                        />
                      </div>
                    </div>
                  </button>
                </div>

                {/* Logout */}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors border-t border-gray-50 dark:border-gray-800"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── Mobile nav item ──────────────────────────────────────────────────────────

function MobileNavItem({
  item,
  onClose,
  onNavigate,
}: {
  item: NavItem;
  onClose: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = item.exact
    ? pathname === item.path
    : pathname === item.path || pathname.startsWith(item.path + '/');
  const Icon = item.icon;

  return (
    <Link
      href={item.path}
      onClick={() => { onClose(); onNavigate?.(); }}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
        isActive
          ? 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      )}
    >
      {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
      <span className="flex-1">{item.label}</span>
      {item.badge != null && item.badge > 0 && (
        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-violet-500 text-white text-[10px] font-semibold flex items-center justify-center">
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      )}
    </Link>
  );
}

// ─── Mobile Navbar ────────────────────────────────────────────────────────────

function Navbar({ user, items = [], onNavigate, className }: NavbarProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = useCallback(async () => {
    onNavigate?.();
    setMobileOpen(false);
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
      router.push('/');
    } catch {
      toast.error('Failed to sign out');
    }
  }, [onNavigate, router]);

  const initials = user?.first_name
    ? `${user.first_name[0]}${user.last_name?.[0] ?? ''}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?';

  const displayName = user?.first_name
    ? `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`
    : user?.email ?? '';

  return (
    <>
      <header className={cn(
        'lg:hidden sticky top-0 z-50',
        'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md',
        'border-b border-gray-100 dark:border-gray-800',
        className
      )}>
        <div className="flex items-center justify-between px-4 h-14">
          <Link href={items[0]?.path ?? '/'} onClick={onNavigate} aria-label="Home">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xs">D</span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">Diltak.ai</span>
            </div>
          </Link>
          <div className="flex items-center gap-1.5">
            <ThemeToggle size="sm" />
            <button
              onClick={() => setMobileOpen(v => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/20 dark:bg-black/40"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'lg:hidden fixed top-14 left-0 right-0 z-50',
          'bg-white dark:bg-gray-900',
          'border-b border-gray-100 dark:border-gray-800 shadow-xl',
          'max-h-[calc(100dvh-3.5rem)] overflow-y-auto',
          'transition-[transform,opacity] duration-200 ease-out',
          mobileOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-2 opacity-0 pointer-events-none'
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="px-3 py-3 flex flex-col gap-0.5">
          {items.map((item) => (
            <MobileNavItem
              key={item.path}
              item={item}
              onClose={() => setMobileOpen(false)}
              onNavigate={onNavigate}
            />
          ))}
          <div className="mt-2 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
            {user && (
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800">
                <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">{initials}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{displayName}</p>
                  {user.role && <p className="text-xs text-gray-400 capitalize">{user.role}</p>}
                </div>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(Navbar);
