'use client';

import { type ReactNode } from 'react';
import AppLayout from './AppLayout';
import { employeeNavItems } from './nav-configs';
import type { NavbarUser } from './Navbar';

interface EmployeeLayoutProps {
  user?: NavbarUser;
  children: ReactNode;
  onNavigate?: () => void;
}

export default function EmployeeLayout({ user, children, onNavigate }: EmployeeLayoutProps) {
  return (
    <AppLayout
      items={employeeNavItems}
      user={user}
      onNavigate={onNavigate}
      contentClassName="min-h-screen"
    >
      {children}
    </AppLayout>
  );
}
