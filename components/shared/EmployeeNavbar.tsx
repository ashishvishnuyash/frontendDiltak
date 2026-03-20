/**
 * EmployeeNavbar — re-exports the new reusable AppLayout components.
 *
 * All existing employee pages import this file and render:
 *   <EmployeeNavbar user={user} onNavigate={...} />
 *
 * We now render both the mobile Navbar and the desktop Sidebar from
 * components/newcomponents so every employee page gets the unified layout
 * without touching each page individually.
 */
'use client';

import { memo } from 'react';
import Navbar from '@/components/newcomponents/Navbar';
import Sidebar from '@/components/newcomponents/Sidebar';
import { employeeNavItems } from '@/components/newcomponents/nav-configs';
import type { NavbarUser } from '@/components/newcomponents/Navbar';

interface EmployeeNavbarProps {
  user?: NavbarUser;
  onNavigate?: () => void;
}

function EmployeeNavbar({ user, onNavigate }: EmployeeNavbarProps) {
  return (
    <>
      {/* Mobile top bar */}
      <Navbar user={user} items={employeeNavItems} onNavigate={onNavigate} />
      {/* Desktop sidebar */}
      <Sidebar items={employeeNavItems} user={user} onNavigate={onNavigate} />
    </>
  );
}

export default memo(EmployeeNavbar);
