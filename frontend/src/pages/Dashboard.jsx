import React, { useState } from "react";
import { useTransactions } from "../context/TransactionsContext.jsx";
import TotalsHeader from "../components/TotalsHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";
import TransactionForm from "../ui/TransactionForm.jsx";
import TransactionsTable from "../ui/TransactionsTable.jsx";
import CombinedAnalyticsChart from "../components/CombinedAnalyticsChart.jsx";

export default function Dashboard() {
  const { summaryError, totals } = useTransactions();
  const { token, preferences } = useAuth();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={() => setShowForm((f) => !f)}
          className="bg-blue-600 text-white px-3 py-1"
        >
          {showForm ? "Close" : "Add Transaction"}
        </button>
      </div>
      {showForm && <TransactionForm onDone={() => setShowForm(false)} />}
      <TotalsHeader />
      {preferences?.alertOnNegativeNet &&
        typeof totals?.net === "number" &&
        totals.net < 0 && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded max-w-md">
            Warning: Net balance -
            {formatCurrency(
              Math.abs(totals.net),
              totals.currency || preferences.currency
            )}{" "}
            is negative.
          </div>
        )}
      {summaryError && (
        <div className="text-xs text-red-600">{summaryError}</div>
      )}
      <CombinedAnalyticsChart />
      <div className="mt-4">
        <TransactionsTable />
      </div>
    </div>
  );
}
