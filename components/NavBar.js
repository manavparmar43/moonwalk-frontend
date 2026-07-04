'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getUser, clearAuth } from '../lib/auth';

export default function NavBar() {
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setUser(getUser());
  }, [pathname]);

  function handleLogout() {
    clearAuth();
    setUser(null);
    router.push('/login');
  }

  const isPublicTrackingPage = pathname?.startsWith('/order/');

  return (
    <header className="navbar">
      <Link href="/" className="brand">MoonWalk</Link>
      <nav>
        {isPublicTrackingPage ? null : user ? (
          <button className="secondary" onClick={handleLogout}>Log out</button>
        ) : pathname === '/login' ? (
          <Link href="/register" className="cta">Register restaurant</Link>
        ) : pathname === '/register' ? (
          <Link href="/login" className="cta">Log in</Link>
        ) : (
          <>
            <Link href="/login">Log in</Link>
            <Link href="/register" className="cta">Register restaurant</Link>
          </>
        )}
      </nav>
    </header>
  );
}
