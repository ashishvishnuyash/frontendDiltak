'use client';

import { type ReactNode } from 'react';
import AppLayout from './AppLayout';
import { employerNavItems } from './nav-configs';
import type { NavbarUser } from './Navbar';

interface EmployerLayoutProps {
  user?: NavbarUser;
  children: ReactNode;
  onNavigate?: () => void;
}

export default function EmployerLayout({ user, children, onNavigate }: EmployerLayoutProps) {
  return (
    <AppLayout
      items={employerNavItems}
      user={user}
      onNavigate={onNavigate}
      contentClassName="min-h-screen"
    >
      {children}
    </AppLayout>
  );
}
