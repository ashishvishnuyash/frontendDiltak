'use client';

import { memo, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Sidebar, { type SidebarProps } from './Sidebar';
import Navbar, { DesktopTopBar, type NavbarUser } from './Navbar';
import type { NavItem } from './Sidebar';

export interface AppLayoutProps {
  items: NavItem[];
  user?: NavbarUser;
  children: ReactNode;
  onNavigate?: () => void;
  contentClassName?: string;
  pageTitle?: string;
  pageSubtitle?: string;
}

function AppLayout({ items, user, children, onNavigate, contentClassName, pageTitle, pageSubtitle }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-foreground">
      {/* Mobile navbar */}
      <Navbar user={user} items={items} onNavigate={onNavigate} />

      {/* Desktop sidebar */}
      <Sidebar
        items={items}
        onNavigate={onNavigate}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        user={user}
      />

      {/* Content area — offset by sidebar */}
      <div
        className={cn(
          'transition-[padding-left] duration-200 ease-in-out',
          'lg:pl-56',
          collapsed && 'lg:pl-[72px]'
        )}
      >
        {/* Desktop top bar */}
        <DesktopTopBar user={user} pageTitle={pageTitle} pageSubtitle={pageSubtitle} />

        <main className={cn('min-h-[calc(100vh-60px)]', contentClassName)}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default memo(AppLayout);
