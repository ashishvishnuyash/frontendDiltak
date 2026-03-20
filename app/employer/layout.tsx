'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/newcomponents/Sidebar';
import Navbar, { DesktopTopBar } from '@/components/newcomponents/Navbar';
import { employerNavItems } from '@/components/newcomponents/nav-configs';
import { useAuth } from '@/contexts/auth-context';

export default function EmployerModuleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navUser = user
    ? { first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role }
    : undefined;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile top bar */}
      <Navbar user={navUser} items={employerNavItems} />

      {/* Desktop sidebar — fixed, collapsible */}
      <Sidebar
        items={employerNavItems}
        user={navUser}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      />

      {/* Main content — offset matches sidebar width */}
      <div
        className={cn(
          'transition-[padding-left] duration-200 ease-in-out',
          collapsed ? 'lg:pl-[72px]' : 'lg:pl-56'
        )}
      >
        {/* Desktop top bar */}
        <DesktopTopBar user={navUser} />

        <main className="min-h-[calc(100vh-60px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
