// DEPRECATED: Replaced by CombinedAnalyticsChart. Kept temporarily for reference.
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  CartesianGrid,
  Cell,
} from "recharts";
import { formatHUF } from "../utils/formatCurrency.js";

const COLOR_INCOME = "#16a34a";
const COLOR_EXPENSE = "#dc2626";
const COLOR_NET_POS = "#2563eb";
const COLOR_NET_NEG = "#9333ea";

export default function CategoryChart({ data, sortBy = "income", limit = 12 }) {
  const rows = useMemo(() => {
    const merged = Object.values(
      data.reduce((acc, item) => {
        const key = item.category;
        acc[key] = acc[key] || { category: key, income: 0, expense: 0 };
        acc[key][item.type] += item.total;
        return acc;
      }, {})
    );
    const grandIncome = merged.reduce((s, m) => s + m.income, 0) || 0;
    const grandExpense = merged.reduce((s, m) => s + m.expense, 0) || 0;
    const totalAll = grandIncome + grandExpense;
    const singleIncome = merged.filter((m) => m.income > 0).length === 1;
    const singleExpense = merged.filter((m) => m.expense > 0).length === 1;
    const enriched = merged.map((m) => ({
      category: m.category,
      income: m.income,
      expense: m.expense,
      incomePct:
        grandIncome && !singleIncome ? (m.income / grandIncome) * 100 : 0,
      expensePct:
        grandExpense && !singleExpense ? (m.expense / grandExpense) * 100 : 0,
      combinedPct: totalAll ? ((m.income + m.expense) / totalAll) * 100 : 0,
      net: m.income - m.expense,
    }));
    const sorter = (a, b) => {
      switch (sortBy) {
        case "expense":
          return b.expense - a.expense;
        case "net":
          return b.net - a.net;
        case "incomePct":
          return b.incomePct - a.incomePct;
        case "expensePct":
          return b.expensePct - a.expensePct;
        case "income":
        default:
          return b.income - a.income;
      }
    };
    return enriched.sort(sorter).slice(0, limit);
  }, [data, sortBy, limit]);

  return (
    <div className="h-[480px] bg-white border rounded shadow p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-lg">Income vs Expense by Category</h2>
        <span className="text-xs text-gray-500">Sorted by {sortBy}</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          margin={{ top: 20, right: 25, left: 0, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="category"
            angle={-35}
            textAnchor="end"
            interval={0}
            height={70}
          />
          <YAxis />
          <Tooltip
            contentStyle={{ fontSize: "0.75rem" }}
            formatter={(value, name) => {
              if (name === "income") return [formatHUF(value), "Income"];
              if (name === "expense") return [formatHUF(value), "Expense"];
              if (name === "net") return [formatHUF(value), "Net"];
              return [formatHUF(value), name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
          <Bar
            dataKey="income"
            name="Income"
            fill={COLOR_INCOME}
            radius={[4, 4, 0, 0]}
          >
            <LabelList
              dataKey="incomePct"
              position="top"
              formatter={(v) => (v > 0 ? v.toFixed(0) + "%" : "")}
              style={{ fontSize: "0.65rem" }}
            />
          </Bar>
          <Bar
            dataKey="expense"
            name="Expense"
            fill={COLOR_EXPENSE}
            radius={[4, 4, 0, 0]}
          >
            <LabelList
              dataKey="expensePct"
              position="top"
              formatter={(v) => (v > 0 ? v.toFixed(0) + "%" : "")}
              style={{ fontSize: "0.65rem" }}
            />
          </Bar>
          <Bar dataKey="net" name="Net" radius={[4, 4, 0, 0]}>
            {rows.map((r) => (
              <Cell
                key={r.category}
                fill={r.net >= 0 ? COLOR_NET_POS : COLOR_NET_NEG}
              />
            ))}
            <LabelList
              dataKey="net"
              position="top"
              formatter={(v) => (v !== 0 ? formatHUF(v) : "")}
              style={{ fontSize: "0.65rem" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-500 mt-2">
        Labels show % share (income/expense). Net bar color: blue for positive
        (surplus), purple for negative (deficit).
      </p>
    </div>
  );
}
