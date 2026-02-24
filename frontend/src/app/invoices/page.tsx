'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function InvoicesPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.get('/invoices').then((r) => setRows(r.data.data)); }, []);

  return <div className="bg-white p-4 rounded-xl border"><h2 className="font-semibold mb-3">Invoices</h2>{rows.map((i) => <p key={i.id}>{i.invoiceNumber} - ₦{(i.totalKobo/100).toFixed(2)} - {i.status}</p>)}</div>;
}
