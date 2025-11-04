import React, { useMemo, useState } from "react";
import { iconForCategory } from "../utils/categoryIcons.js";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";
import { useTransactions } from "../context/TransactionsContext.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";


export default function CombinedAnalyticsChart() {
  const { categorySummary, monthlySummary, totals } = useTransactions();
  const [mode, setMode] = useState("category");
  const [sortMetric, setSortMetric] = useState("net");

  const data = useMemo(() => {
    if (mode === "category") {

      const merged = Object.values(
        categorySummary.reduce((acc, row) => {
          const key = row.category;
          acc[key] = acc[key] || {
            key: key,
            category: key,
            income: 0,
            expense: 0,
          };
          acc[key][row.type] += row.total;
          return acc;
        }, {})
      );

      const totalIncome = merged.reduce((s, m) => s + m.income, 0);
      const totalExpense = merged.reduce((s, m) => s + m.expense, 0);
      const globalNet = totalIncome - totalExpense;
      merged.forEach((m) => (m.net = globalNet)); // same net for every category per requirement
      const sorter = (a, b) => {
        switch (sortMetric) {
          case "income":
            return b.income - a.income;
          case "expense":
            return b.expense - a.expense;
          case "net":
            return b.net - a.net;
          default:
            return b.income - a.income;
        }
      };
      return merged.sort(sorter).slice(0, 12); // fixed top 12
    } else if (mode === "month") {
      // monthlySummary already shaped
      return monthlySummary.map((m) => ({ ...m }));
    }
    return [];
  }, [mode, categorySummary, monthlySummary, sortMetric]);

  const xDataKey = mode === "category" ? "category" : "month";

  const dark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");
  const axisTickColor = dark ? "#94a3b8" : "#374151";
  const gridColor = dark ? "#334155" : "#e5e7eb";
  const tooltipStyle = {
    fontSize: "0.75rem",
    background: dark ? "#1e293b" : "#ffffff",
    border: dark ? "1px solid #334155" : "1px solid #e5e7eb",
    color: dark ? "#f1f5f9" : "#111827",
  };

  const currency = totals?.currency || data[0]?.currency || "HUF";
  return (
    <div className="bg-white dark:bg-slate-900 border dark:border-slate-700 rounded shadow p-4 h-[520px] flex flex-col transition-colors duration-500">
      <div className="flex flex-wrap items-center gap-4 mb-3 text-sm">
        <h2 className="font-semibold text-lg flex-grow">
          Analytics: Income vs Expense (
          {mode === "category" ? "Top Categories" : "By Month"})
        </h2>
        <label className="flex items-center gap-1">
          View:
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="border rounded px-1 py-0.5 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
          >
            <option value="category">Category</option>
            <option value="month">Month</option>
          </select>
        </label>
        {mode === "category" && (
          <label className="flex items-center gap-1">
            Sort:
            <select
              value={sortMetric}
              onChange={(e) => setSortMetric(e.target.value)}
              className="border rounded px-1 py-0.5 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="net">Net</option>
            </select>
          </label>
        )}
      </div>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 40, bottom: 60, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey={xDataKey}
              angle={-35}
              textAnchor="end"
              interval={0}
              height={70}
              tickFormatter={(v) =>
                mode === "category" ? `${iconForCategory(v)} ${v}` : v
              }
              tick={{ fontSize: 12, fill: axisTickColor }}
            />
            <YAxis
              tickFormatter={(v) =>
                formatCurrency(v, currency).replace(` ${currency}`, "")
              }
              width={70}
              tick={{ fontSize: 12, fill: axisTickColor }}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value, name) => {
                if (name === "Net" && mode === "category") {
                  return [formatCurrency(value, currency), "Global Net"];
                }
                return [
                  formatCurrency(value, currency),
                  name.charAt(0).toUpperCase() + name.slice(1),
                ];
              }}
              labelFormatter={(label) => label}
            />
            <Legend wrapperStyle={{ fontSize: "0.7rem" }} />
            <Bar
              dataKey="income"
              name="Income"
              fill={dark ? "#15803d" : "#16a34a"}
              stackId="stack"
              radius={[4, 4, 0, 0]}
            >
              <LabelList
                dataKey="income"
                position="top"
                formatter={(v) => (v > 0 ? formatCurrency(v, currency) : "")}
                style={{ fontSize: "0.6rem" }}
              />
            </Bar>
            <Bar
              dataKey="expense"
              name="Expense"
              fill={dark ? "#b91c1c" : "#dc2626"}
              stackId="stack"
              radius={[4, 4, 0, 0]}
            >
              <LabelList
                dataKey="expense"
                position="top"
                formatter={(v) => (v > 0 ? formatCurrency(v, currency) : "")}
                style={{ fontSize: "0.6rem" }}
              />
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
        Category view shows top 12 categories; Month view shows monthly totals.
        Values displayed in {currency}. Global net applies to category sort.
      </p>
    </div>
  );
}
