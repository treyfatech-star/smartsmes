'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '@/lib/api';
import { MetricCard } from '@/components/MetricCard';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    api.get('/dashboard/metrics').then((res) => setMetrics(res.data));
  }, []);

  if (!metrics) return <p>Loading dashboard...</p>;

  const chartData = [
    { name: 'Revenue', amount: metrics.monthlyRevenueKobo / 100 },
    { name: 'Expenses', amount: metrics.monthlyExpensesKobo / 100 },
    { name: 'Output VAT', amount: metrics.outputVatKobo / 100 },
    { name: 'Input VAT', amount: metrics.inputVatKobo / 100 }
  ];

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">VAT Compliance Dashboard</h2>
      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Monthly Revenue" value={`₦${(metrics.monthlyRevenueKobo / 100).toFixed(2)}`} />
        <MetricCard label="Monthly Expenses" value={`₦${(metrics.monthlyExpensesKobo / 100).toFixed(2)}`} />
        <MetricCard label="Net VAT Payable" value={`₦${(metrics.netVatPayableKobo / 100).toFixed(2)}`} />
        <MetricCard label="Outstanding Invoices" value={String(metrics.outstandingInvoices)} />
        <MetricCard label="VAT Compliance" value={metrics.vatComplianceIndicator} />
      </div>
      <div className="h-64 rounded-xl bg-white p-4 border border-slate-200">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#0f766e" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
