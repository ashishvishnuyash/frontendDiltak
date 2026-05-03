'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/newcomponents/Sidebar';
import Navbar, { DesktopTopBar } from '@/components/newcomponents/Navbar';
import { adminNavItems } from '@/components/newcomponents/nav-configs';
import { useAuth } from '@/contexts/auth-context';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navUser = user
    ? { first_name: user.first_name, last_name: user.last_name, email: user.email, role: 'admin' }
    : undefined;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar user={navUser} items={adminNavItems} />
      <Sidebar
        items={adminNavItems}
        user={navUser}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      />
      <div className={cn(
        'transition-[padding-left] duration-200 ease-in-out',
        collapsed ? 'lg:pl-[72px]' : 'lg:pl-56'
      )}>
        <DesktopTopBar user={navUser} />
        <main className="min-h-[calc(100vh-60px)]">{children}</main>
      </div>
    </div>
  );
}
