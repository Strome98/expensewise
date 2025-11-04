import React, { useState, useEffect } from 'react';
import { iconForCategory } from '../utils/categoryIcons.js';
import { useTransactions } from '../context/TransactionsContext.jsx';
const PREDEFINED_CATEGORIES = [
  'Food', 'Transport', 'Housing', 'Utilities', 'Health', 'Entertainment', 'Education', 'Travel', 'Groceries', 'Salary', 'Freelance', 'Investments', 'Gifts', 'Other'
];

export default function TransactionForm({onDone}){
  const { addTransaction } = useTransactions();
  const [type,setType] = useState('expense');
  const [amount,setAmount] = useState('');
  const [category,setCategory] = useState(PREDEFINED_CATEGORIES[0]);
  const [note,setNote] = useState('');
  const [date,setDate] = useState(()=>new Date().toISOString().slice(0,10));
  const [error,setError] = useState(null);

  async function handleSubmit(e){
    e.preventDefault();
    setError(null);
    if(!amount || !category){ setError('Amount & category required'); return; }
    try {
      await addTransaction({type, amount:Number(amount), category, note, date});
      setType('expense'); setAmount(''); setCategory(''); setNote('');
      if(onDone) onDone();
    } catch (e) {
      setError('Failed to add');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid md:grid-cols-6 gap-2 bg-white p-4 border rounded shadow">
      <select value={type} onChange={e=>setType(e.target.value)} className="border p-2 md:col-span-1">
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
      <input value={amount} onChange={e=>setAmount(e.target.value)} type="number" placeholder="Amount" className="border p-2 md:col-span-1" />
      <select value={category} onChange={e=>setCategory(e.target.value)} className="border p-2 md:col-span-1">
        {PREDEFINED_CATEGORIES.map(c=> <option key={c} value={c}>{iconForCategory(c)} {c}</option>)}
      </select>
      <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Note" className="border p-2 md:col-span-1" />
      <input value={date} onChange={e=>setDate(e.target.value)} type="date" className="border p-2 md:col-span-1" />
      <div className="md:col-span-1 flex flex-col">
        <button className="bg-green-600 text-white p-2 mb-1">Save</button>
        {error && <span className="text-red-600 text-xs">{error}</span>}
      </div>
    </form>
  );
}
