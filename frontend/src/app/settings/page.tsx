'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const [sub, setSub] = useState<any>(null);
  useEffect(() => { api.get('/subscriptions/current').then((r) => setSub(r.data.data)); }, []);

  return (
    <div className="bg-white p-4 rounded-xl border">
      <h2 className="font-semibold mb-3">Subscription</h2>
      {!sub ? <p>Loading...</p> : <p>Tier: {sub.tier} · Status: {sub.status} · Stripe Ready IDs Supported</p>}
    </div>
  );
}
