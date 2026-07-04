'use client';

import { useEffect, useState } from 'react';

export function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function CountdownTimer({ startedAt, durationMs }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!startedAt || !durationMs) return <div className="countdown">Waiting to start</div>;

  const elapsed = now - new Date(startedAt).getTime();
  const remaining = durationMs - (elapsed % durationMs);

  return <div className="countdown">{formatDuration(remaining)}</div>;
}
