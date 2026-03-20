/**
 * navbar.tsx — employer pages use `import { Navbar } from '@/components/shared/navbar'`
 *
 * This file now delegates to the new reusable components while preserving
 * the named export so no employer page needs to change.
 */
'use client';

import { memo } from 'react';
import NewNavbar from '@/components/newcomponents/Navbar';
import Sidebar from '@/components/newcomponents/Sidebar';
import { employerNavItems } from '@/components/newcomponents/nav-configs';
import type { NavbarUser } from '@/components/newcomponents/Navbar';

interface NavbarProps {
  user?: NavbarUser;
  onNavigate?: () => void;
}

function NavbarComponent({ user, onNavigate }: NavbarProps) {
  return (
    <>
      {/* Mobile top bar */}
      <NewNavbar user={user} items={employerNavItems} onNavigate={onNavigate} />
      {/* Desktop sidebar */}
      <Sidebar items={employerNavItems} user={user} onNavigate={onNavigate} />
    </>
  );
}

export const Navbar = memo(NavbarComponent);
export default Navbar;
