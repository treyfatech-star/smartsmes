'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function ExpensesPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.get('/expenses').then((r) => setRows(r.data.data)); }, []);
  return <div className="bg-white p-4 rounded-xl border"><h2 className="font-semibold mb-3">Expenses</h2>{rows.map((e) => <p key={e.id}>{e.category} - ₦{(e.grossAmountKobo/100).toFixed(2)} (Input VAT ₦{(e.inputVatKobo/100).toFixed(2)})</p>)}</div>;
}
