# 02-Principles: Architectural Patterns in ExpenseScope

This document outlines the core engineering principles and architectural patterns used in the ExpenseScope Dashboard.

## 1. Single Source of Truth (SSOT)
The entire application state originates from a single location: the `expenses` array within the `ExpenseProvider` (`src/context/ExpenseContext.tsx`).
- **Persistence:** This state is synchronized with browser `localStorage` via the `useLocalStorage` hook.
- **Consistency:** By centralizing state, we ensure that the `ExpenseList`, `SummaryCards`, and all charts always reflect the same underlying data, preventing "out-of-sync" UI bugs.

## 2. Immutability
Data is never modified "in-place." Instead of changing existing objects or arrays, we create new versions.
- **State Updates:** When adding an expense, we use the spread operator to create a new array: `setExpenses((prev) => [expenseWithId, ...prev])`.
- **Deletions:** We use `.filter()` which returns a *new* array rather than removing items from the original one.
- **Benefits:** This makes state changes predictable and allows React to efficiently detect when it needs to re-render the UI.

## 3. Pure Functions for Logic
The application logic is decoupled from the UI using "pure functions"—functions that return the same output for the same input and have no side effects.
- **Filtering:** Functions like `isInThisWeek(date)` and `isInLastWeek(date)` in `src/utils/dateHelpers.ts` are pure. They take a date string and return a boolean.
- **Formatting:** `formatAmount` and `formatLocalDate` are pure utilities that transform data without touching global state.

## 4. Derived State (Memoization)
Instead of storing redundant data (like "total spending" or "category totals") in state, we compute it on-the-fly from the raw `expenses` list.
- **`useMemo` Hook:** We use `useMemo` in `ExpenseContext.tsx` to calculate `filteredExpenses`, `categoryAggregates`, and `dailySpending`.
- **Efficiency:** These calculations only re-run when the source data (`expenses`) or the dependencies (`filter`) change. This prevents unnecessary work and keeps the "source of truth" lean.

## 5. Separation of Data and Presentation
There is a clear boundary between *how data is managed* and *how it looks*.
- **Data Layer:** `ExpenseContext.tsx` handles the "business logic" (sorting, filtering, calculating).
- **Presentation Layer:** Components like `BarChart.tsx` or `DonutChart.tsx` are "dumb" regarding where the data comes from; they simply consume the `dailySpending` or `categoryAggregates` provided to them and render SVGs.
- **Config-Driven UI:** Visual properties like colors and icons are separated into `src/utils/categoryConfig.ts`, making the UI easy to theme or extend.

## 6. Functional Composition
The UI is built by composing small, focused components. Each component has a single responsibility:
- `ExpenseForm`: Captures input.
- `FilterTabs`: Controls the view state.
- `SummaryCards`: Displays high-level aggregates.
- `ExpenseProvider`: Orchestrates data flow.

---

### Summary Table

| Principle | Implementation | Why it matters |
|-----------|----------------|----------------|
| **SSOT** | `expenses` state in Context | No data inconsistency. |
| **Immutability** | `[...prev]`, `.filter()` | Predictable UI updates. |
| **Pure Functions** | `dateHelpers.ts` | Easy to test and reuse. |
| **Derived State** | `useMemo` for aggregates | Keeps state minimal and fast. |
| **Separation** | Context vs. SVG Components | Code is easier to maintain. |
| **Composition** | Atomic components | Flexible and readable layout. |
