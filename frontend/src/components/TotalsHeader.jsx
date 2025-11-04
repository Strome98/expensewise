import React from "react";
import { useTransactions } from "../context/TransactionsContext.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";

export default function TotalsHeader() {
  const { totals, totalsError } = useTransactions();

  const currency = totals.currency || "HUF";
  const incomeStr = formatCurrency(totals.income || 0, currency);
  const expenseStr =
    "-" + formatCurrency(totals.expense || 0, currency).replace(/^-/, "");
  const netValue = typeof totals.net === "number" ? totals.net : 0;
  const netStr = `${netValue < 0 ? "-" : ""}${formatCurrency(
    Math.abs(netValue),
    currency
  )}`;

  return (
    <div className="grid md:grid-cols-3 gap-3 mb-4">
      <div className="p-4 rounded border bg-white dark:bg-slate-800 dark:border-slate-700 flex flex-col">
        <span className="text-xs uppercase text-gray-500">Income</span>
        <span className="text-lg font-semibold text-green-700">
          {incomeStr}
        </span>
      </div>
      <div className="p-4 rounded border bg-white dark:bg-slate-800 dark:border-slate-700 flex flex-col">
        <span className="text-xs uppercase text-gray-500">Expense</span>
        <span className="text-lg font-semibold text-red-700">{expenseStr}</span>
      </div>
      <div className="p-4 rounded border bg-white dark:bg-slate-800 dark:border-slate-700 flex flex-col">
        <span className="text-xs uppercase text-gray-500">Net</span>
        <span
          className={`text-lg font-semibold ${
            netValue >= 0 ? "text-blue-700" : "text-red-700"
          }`}
        >
          {netStr}
        </span>
      </div>
      {totalsError && (
        <div className="md:col-span-3 text-xs text-red-600">{totalsError}</div>
      )}
    </div>
  );
}
