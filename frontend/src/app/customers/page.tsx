'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function CustomersPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.get('/customers').then((r) => setRows(r.data.data)); }, []);
  return <div className="bg-white p-4 rounded-xl border"><h2 className="font-semibold mb-3">Customers</h2>{rows.map((c) => <p key={c.id}>{c.name} {c.tin ? `(${c.tin})`: ''}</p>)}</div>;
}
