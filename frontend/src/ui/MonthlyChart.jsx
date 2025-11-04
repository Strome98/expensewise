// DEPRECATED: Replaced by CombinedAnalyticsChart. Kept temporarily for reference.
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatHUF } from '../utils/formatCurrency.js';

export default function MonthlyChart({data}){
  return (
    <div className="h-64">
      <h2 className="font-semibold mb-2">Monthly Trend (Net)</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value, name)=> [formatHUF(value), name.charAt(0).toUpperCase()+name.slice(1)]} />
          <Legend />
          <Line type="monotone" dataKey="income" stroke="#16a34a" />
          <Line type="monotone" dataKey="expense" stroke="#dc2626" />
          <Line type="monotone" dataKey="net" stroke="#2563eb" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
