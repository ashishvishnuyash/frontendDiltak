'use client';

import { type ReactNode } from 'react';
import AppLayout from './AppLayout';
import { managerNavItems } from './nav-configs';
import type { NavbarUser } from './Navbar';

interface ManagerLayoutProps {
  user?: NavbarUser;
  children: ReactNode;
  onNavigate?: () => void;
}

export default function ManagerLayout({ user, children, onNavigate }: ManagerLayoutProps) {
  return (
    <AppLayout
      items={managerNavItems}
      user={user}
      onNavigate={onNavigate}
      contentClassName="min-h-screen"
    >
      {children}
    </AppLayout>
  );
}
