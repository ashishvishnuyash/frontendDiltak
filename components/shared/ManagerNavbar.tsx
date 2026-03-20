/**
 * ManagerNavbar — delegates to the new reusable AppLayout components.
 * Preserves the existing import interface used by manager pages.
 */
'use client';

import { memo } from 'react';
import Navbar from '@/components/newcomponents/Navbar';
import Sidebar from '@/components/newcomponents/Sidebar';
import { managerNavItems } from '@/components/newcomponents/nav-configs';
import type { NavbarUser } from '@/components/newcomponents/Navbar';

interface ManagerNavbarProps {
  user?: NavbarUser;
  onNavigate?: () => void;
}

function ManagerNavbar({ user, onNavigate }: ManagerNavbarProps) {
  return (
    <>
      {/* Mobile top bar */}
      <Navbar user={user} items={managerNavItems} onNavigate={onNavigate} />
      {/* Desktop sidebar */}
      <Sidebar items={managerNavItems} user={user} onNavigate={onNavigate} />
    </>
  );
}

export default memo(ManagerNavbar);
