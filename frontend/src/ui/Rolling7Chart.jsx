// DEPRECATED: Functionality superseded by CombinedAnalyticsChart (mode monthCategory + month views).
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatHUF } from '../utils/formatCurrency.js';

export default function Rolling7Chart({data}){
  // expect [{day:'YYYY-MM-DD', income, expense, net}]
  const chartData = (data||[]).map(d=> ({
    day: d.day.slice(5), // show MM-DD
    income: d.income,
    expense: d.expense,
    net: d.net
  }));
  return (
    <div className="h-56 bg-white border rounded shadow p-4">
      <h2 className="font-semibold text-sm mb-2">Last 7 Days (Net)</h2>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top:10, right:10, left:0, bottom:20 }}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="day" tick={{ fontSize:10 }} />
          <YAxis tickFormatter={(v)=> formatHUF(v).replace(' HUF','')} width={60} tick={{ fontSize:10 }} />
          <Tooltip formatter={(value, name)=> [formatHUF(value), name]} labelFormatter={(l)=> 'Day '+l} contentStyle={{ fontSize:'0.7rem' }} />
          <Area type="monotone" dataKey="expense" stroke="#dc2626" fill="url(#expenseGradient)" name="Expense" />
          <Area type="monotone" dataKey="income" stroke="#16a34a" fill="url(#incomeGradient)" name="Income" />
          <Area type="monotone" dataKey="net" stroke="#2563eb" fill="url(#netGradient)" name="Net" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
