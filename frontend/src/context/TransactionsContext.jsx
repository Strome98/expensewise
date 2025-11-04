import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx';

const TransactionsContext = createContext();

export function TransactionsProvider({children}){
  const { token, preferences } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date:desc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totals, setTotals] = useState({ income:0, expense:0, net:0 });
  const [totalsError, setTotalsError] = useState(null);
  const [categorySummary, setCategorySummary] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [summaryError, setSummaryError] = useState(null);
  const [last7Summary, setLast7Summary] = useState([]);
  const [last7Error, setLast7Error] = useState(null);
  const [monthCategorySummary, setMonthCategorySummary] = useState([]);

  const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });
  api.interceptors.request.use(config => {
    if(token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  const fetchTransactions = useCallback(async () => {
    if(!token) return;
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        sort,
      });
      if(categoryFilter) params.append('category', categoryFilter);
      if(typeFilter) params.append('type', typeFilter);
      if(search) params.append('search', search);
  if(preferences?.currency) params.append('currency', preferences.currency);
  const res = await api.get('/transactions?'+params.toString());
      setTransactions(res.data.items);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (e) {
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [token, page, pageSize, categoryFilter, typeFilter, search, sort, preferences?.currency]);

  const fetchTotals = useCallback(async () => {
    if(!token) return;
    setTotalsError(null);
    try {
      const params = new URLSearchParams();
      if(preferences?.currency) params.append('currency', preferences.currency);
      const res = await api.get('/transactions/totals?'+params.toString());
      setTotals(res.data);
    } catch (e) {
      setTotalsError('Failed to load totals');
    }
  }, [token, preferences?.currency]);

  const fetchSummaries = useCallback(async () => {
    if(!token) return;
    setSummaryError(null);
    try {
      const [catRes, monthRes, last7Res, mcRes] = await Promise.all([
        api.get('/transactions/summary/categories'+(preferences?.currency?`?currency=${preferences.currency}`:'')),
        api.get('/transactions/summary/monthly'+(preferences?.currency?`?currency=${preferences.currency}`:'')),
        api.get('/transactions/summary/last7'+(preferences?.currency?`?currency=${preferences.currency}`:'')),
        api.get('/transactions/summary/monthCategory')
      ]);
      setCategorySummary(catRes.data || []);
  setMonthlySummary(monthRes.data || []);
      setLast7Summary(last7Res.data || []);
      setMonthCategorySummary(mcRes.data || []);
    } catch (e) {
      setSummaryError('Failed to load summaries');
    }
  }, [token, preferences?.currency]);

  async function addTransaction(data){
    const res = await api.post('/transactions', data);
    // Refresh both list and totals
    fetchTransactions();
    fetchTotals();
    fetchSummaries();
    return res.data;
  }

  async function updateTransaction(id, data){
    const res = await api.put(`/transactions/${id}`, data);
    fetchTransactions();
    fetchTotals();
    fetchSummaries();
    return res.data;
  }

  async function deleteTransaction(id){
    await api.delete(`/transactions/${id}`);
    fetchTransactions();
    fetchTotals();
    fetchSummaries();
  }

  useEffect(()=>{ fetchTransactions(); fetchTotals(); fetchSummaries(); }, [fetchTransactions, fetchTotals, fetchSummaries]);

  return <TransactionsContext.Provider value={{
    transactions, loading, error,
    addTransaction, updateTransaction, deleteTransaction,
    page, setPage, pageSize, setPageSize, totalPages, total,
    categoryFilter, setCategoryFilter, typeFilter, setTypeFilter,
    search, setSearch, sort, setSort, refetch: fetchTransactions,
    totals, totalsError, refetchTotals: fetchTotals,
    categorySummary, monthlySummary, summaryError, refetchSummaries: fetchSummaries,
    last7Summary, last7Error
    , monthCategorySummary
  }}>{children}</TransactionsContext.Provider>;
}

export function useTransactions(){
  return useContext(TransactionsContext);
}
