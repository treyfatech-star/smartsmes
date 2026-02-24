'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function VendorsPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.get('/vendors').then((r) => setRows(r.data.data)); }, []);
  return <div className="bg-white p-4 rounded-xl border"><h2 className="font-semibold mb-3">Vendors</h2>{rows.map((v) => <p key={v.id}>{v.name}</p>)}</div>;
}
