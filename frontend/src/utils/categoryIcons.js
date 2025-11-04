// Map categories to emoji icons (lightweight, avoids extra deps). Expand as needed.
export const CATEGORY_ICONS = {
  Food: "🍽️",
  Transport: "🚗",
  Housing: "🏠",
  Utilities: "⚡",
  Health: "🩺",
  Entertainment: "🎬",
  Education: "🎓",
  Travel: "✈️",
  Groceries: "🛒",
  Salary: "💼",
  Freelance: "🧑‍💻",
  Investments: "📈",
  Gifts: "🎁",
  Other: "🔖",
};

export function iconForCategory(cat) {
  return CATEGORY_ICONS[cat] || "🔖";
}
