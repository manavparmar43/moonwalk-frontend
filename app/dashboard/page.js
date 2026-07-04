'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getUser } from '../../lib/auth';
import AdminPanel from '../../components/AdminPanel';

export default function DashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken() || !getUser()) {
      router.push('/login');
      return;
    }

    setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
    <div className="page page-wide">
      <AdminPanel />
    </div>
  );
}
