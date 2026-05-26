'use client';

import { useState, useEffect } from 'react';
import { PaymentStatus, Plan } from '../../../generated/client';

export default function DevPaymentsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    fetch('/api/dev/payments')
      .then(res => res.json())
      .then(data => {
        setTransactions(data.transactions || []);
        setIsMock(data.isMock);
        setLoading(false);
      });
  }, []);

  const triggerWebhook = async (externalId: string, status: string) => {
    const res = await fetch('/api/webhooks/xendit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        external_id: externalId,
        status: status,
        paid_at: new Date().toISOString(),
      })
    });
    if (res.ok) {
      alert('Webhook triggered successfully!');
      window.location.reload();
    }
  };

  if (!isMock && !loading) {
    return <div className="p-10 text-red-500">Error: Developer dashboard only available in MOCK mode.</div>;
  }

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Developer Payment Dashboard (Simulation)</h1>
      
      <div className="bg-yellow-900/30 border border-yellow-700 p-4 rounded mb-6 text-yellow-200">
        ⚠️ <strong>Mock Mode Active:</strong> This dashboard is for testing only. No real money is involved.
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-800 text-left">
              <th className="p-3 border border-slate-700">User ID</th>
              <th className="p-3 border border-slate-700">Plan</th>
              <th className="p-3 border border-slate-700">Amount</th>
              <th className="p-3 border border-slate-700">Status</th>
              <th className="p-3 border border-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                <td className="p-3">{tx.userId.slice(0, 8)}...</td>
                <td className="p-3 font-mono text-sm">{tx.plan}</td>
                <td className="p-3">Rp {tx.amount.toLocaleString()}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    tx.status === 'PAID' ? 'bg-green-900 text-green-300' : 
                    tx.status === 'PENDING' ? 'bg-blue-900 text-blue-300' : 'bg-red-900 text-red-300'
                  }`}>
                    {tx.status}
                  </span>
                </td>
                <td className="p-3 space-x-2">
                  {tx.status === 'PENDING' && (
                    <>
                      <button 
                        onClick={() => triggerWebhook(tx.externalId, 'PAID')}
                        className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
                      >
                        Simulate Success
                      </button>
                      <button 
                        onClick={() => triggerWebhook(tx.externalId, 'EXPIRED')}
                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                      >
                        Simulate Expiry
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
