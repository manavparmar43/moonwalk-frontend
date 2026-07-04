'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getUser } from '../../lib/auth';
import AdminPanel from '../../components/AdminPanel';

export default function SuperUserPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!getToken() || !user || !user.isSuperUser) {
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
