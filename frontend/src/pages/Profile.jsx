import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTransactions } from '../context/TransactionsContext.jsx';
import { formatCurrency } from '../utils/formatCurrency.js';

export default function Profile(){
  const { preferences, displayName, updatePreferences, profileLoading, profileError } = useAuth();
  const { totals } = useTransactions();
  const netNegative = totals.net < 0;

  function onToggleAlert(e){
    updatePreferences({ alertOnNegativeNet: e.target.checked });
  }
  function onDisplayNameChange(e){
    updatePreferences({ displayName: e.target.value });
  }
  function onCurrencyChange(e){
    updatePreferences({ currency: e.target.value });
  }
  // Threshold removed per request

  const [exportError, setExportError] = useState(null);
  const [deleteState, setDeleteState] = useState({ scheduledFor: null, error: null, confirming: false });

  async function exportData(format){
    setExportError(null);
    try {
      const token = localStorage.getItem('token');
      const base = import.meta.env.VITE_API_URL;
      const url = `${base}/profile/export?format=${format}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if(!res.ok){ throw new Error('Failed export'); }
      if(format === 'json') {
        const blob = new Blob([JSON.stringify(await res.json(), null, 2)], { type:'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'expensewise_export.json';
        a.click();
      } else {
        const text = await res.text();
        const blob = new Blob([text], { type:'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'expensewise_export.csv';
        a.click();
      }
    } catch (e){
      setExportError('Export failed');
    }
  }

  async function requestDeletion(){
    setDeleteState(s=> ({ ...s, error:null }));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/profile/delete/request`, { method:'POST', headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error||'Failed');
      setDeleteState({ scheduledFor: data.deletionScheduledFor, error:null, confirming:false });
    } catch(e){
      setDeleteState(s=> ({ ...s, error:'Could not schedule deletion' }));
    }
  }

  async function cancelDeletion(){
    setDeleteState(s=> ({ ...s, error:null }));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/profile/delete/cancel`, { method:'POST', headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error||'Failed');
      setDeleteState({ scheduledFor: null, error:null, confirming:false });
    } catch(e){
      setDeleteState(s=> ({ ...s, error:'Could not cancel deletion' }));
    }
  }

  async function executeDeletion(){
    setDeleteState(s=> ({ ...s, error:null }));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/profile/delete/execute`, { method:'DELETE', headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error||'Failed');
      // After deletion, remove token and reload to land on login
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch(e){
      setDeleteState(s=> ({ ...s, error:'Deletion failed (grace period not finished?)' }));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>
  <div className="p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded space-y-4 max-w-md">
        <h2 className="font-semibold">Profile Settings</h2>
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase text-gray-500">Display Name</label>
            <input type="text" value={displayName} onChange={onDisplayNameChange} className="border px-2 py-1 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" placeholder="Your name" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase text-gray-500">Currency</label>
            <select value={preferences.currency} onChange={onCurrencyChange} className="border px-2 py-1 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
              <option value="HUF">HUF (Ft)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          {/* Threshold removed */}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={preferences.alertOnNegativeNet} onChange={onToggleAlert} />
            Enable negative net alert
          </label>
        </div>
        {profileLoading && <div className="text-xs text-gray-500">Loading...</div>}
        {profileError && <div className="text-xs text-red-600">{profileError}</div>}
      </div>
      {preferences.alertOnNegativeNet && netNegative && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded max-w-md">
          Warning: Net balance -{formatCurrency(Math.abs(totals.net), totals.currency || preferences.currency)} is negative.
        </div>
      )}

      <div className="p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded space-y-3 max-w-md">
        <h2 className="font-semibold">Data Export</h2>
        <div className="flex gap-2">
          <button onClick={()=>exportData('json')} className="px-3 py-1 text-sm border rounded hover:bg-blue-50 dark:hover:bg-slate-700">Export JSON</button>
          <button onClick={()=>exportData('csv')} className="px-3 py-1 text-sm border rounded hover:bg-blue-50 dark:hover:bg-slate-700">Export CSV</button>
        </div>
        {exportError && <div className="text-xs text-red-600">{exportError}</div>}
      </div>

      <div className="p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded space-y-3 max-w-md">
        <h2 className="font-semibold">Account Deletion</h2>
        {!deleteState.scheduledFor && (
          <div className="space-y-2">
            <p className="text-xs text-gray-600 dark:text-slate-300">Request deletion to schedule permanent removal after a 7 day grace period. You can cancel anytime before execution.</p>
            {!deleteState.confirming ? (
              <button onClick={()=> setDeleteState(s=> ({ ...s, confirming:true }))} className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700">Request Deletion</button>
            ) : (
              <div className="flex gap-2">
                <button onClick={requestDeletion} className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700">Confirm Request</button>
                <button onClick={()=> setDeleteState(s=> ({ ...s, confirming:false }))} className="px-3 py-1 text-sm border rounded">Cancel</button>
              </div>
            )}
          </div>
        )}
        {deleteState.scheduledFor && (
          <div className="space-y-2">
            <p className="text-xs text-gray-600 dark:text-slate-300">Deletion scheduled for: {new Date(deleteState.scheduledFor).toLocaleString()}. Data will be permanently removed then.</p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={cancelDeletion} className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700">Cancel Deletion</button>
              <button onClick={executeDeletion} className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700">Execute Now</button>
            </div>
          </div>
        )}
        {deleteState.error && <div className="text-xs text-red-600">{deleteState.error}</div>}
      </div>
    </div>
  );
}
