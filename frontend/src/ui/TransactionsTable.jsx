import React from "react";
import { iconForCategory } from "../utils/categoryIcons.js";
import { useTransactions } from "../context/TransactionsContext.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";

export default function TransactionsTable() {
  const {
    transactions,
    deleteTransaction,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    total,
    categoryFilter,
    setCategoryFilter,
    typeFilter,
    setTypeFilter,
    search,
    setSearch,
    sort,
    setSort,
    loading,
    totals,
  } = useTransactions();
  const fallbackCurrency = totals?.currency || "HUF";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search note/category"
          className="border p-2 flex-1 min-w-[160px] dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
        />
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="border p-2 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
        >
          <option value="">All Categories</option>
          {[...new Set(transactions.map((t) => t.category))].map((c) => (
            <option key={c} value={c}>
              {iconForCategory(c)} {c}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="border p-2 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
        >
          <option value="">All Types</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
          }}
          className="border p-2 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
        >
          <option value="date:desc">Date ↓</option>
          <option value="date:asc">Date ↑</option>
          <option value="amount:desc">Amount ↓</option>
          <option value="amount:asc">Amount ↑</option>
        </select>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
          className="border p-2 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
        >
          {[10, 20, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n}/page
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border bg-white dark:bg-slate-900 dark:border-slate-700 shadow text-sm">
          <thead className="bg-gray-100 dark:bg-slate-800">
            <tr>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Note</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t._id} className="border-t dark:border-slate-700">
                <td className="p-2">{new Date(t.date).toLocaleDateString()}</td>
                <td className="p-2 capitalize">{t.type}</td>
                <td className="p-2">
                  {iconForCategory(t.category)} {t.category}
                </td>
                <td
                  className={
                    "p-2 font-medium " +
                    (t.type === "expense" ? "text-red-700" : "text-green-700")
                  }
                >
                  {t.type === "expense" ? "-" : ""}
                  {formatCurrency(t.amount, t.currency || fallbackCurrency)}
                </td>
                <td className="p-2">{t.note}</td>
                <td className="p-2 text-right">
                  <button
                    onClick={() => deleteTransaction(t._id)}
                    className="text-xs text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && transactions.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center dark:text-slate-300">
                  No transactions
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan="6" className="p-4 text-center dark:text-slate-300">
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm">
        <div>
          Page {page} / {totalPages} • {total} total
        </div>
        <div className="space-x-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
