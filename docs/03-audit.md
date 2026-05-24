# 03-Audit: Security, Performance, and Resilience

This document provides a comprehensive audit of the ExpenseScope Dashboard, identifying potential risks, performance bottlenecks, and edge-case behaviors.

---

## 1. Security & XSS (Cross-Site Scripting)
**Status: ✅ Low Risk**

- **Analysis:** React's default behavior escapes all strings rendered in JSX, which mitigates most common XSS attacks. A search for `dangerouslySetInnerHTML` yielded no results, indicating no explicit bypasses of React's escaping.
- **Vulnerability:** User-provided `description` is stored and rendered directly. While React escapes it, if this data were ever used in a non-React context (e.g., direct DOM manipulation or server-side rendering without escaping), it could be a risk.
- **Recommendation:** Always treat user-provided strings as untrusted. If future features include exporting data to HTML, ensure proper sanitization.

## 2. Performance & Scalability
**Status: ⚠️ Medium Risk (Long-term)**

- **Current State:** The app uses `useMemo` effectively for derived state (filtering and aggregation).
- **Bottlenecks:**
  - **Array Operations:** Calculations like `categoryAggregates` and `dailySpending` iterate over the entire `expenses` list. While fast for hundreds of items, performance will degrade as the list grows to thousands.
  - **Storage:** `localStorage` is synchronous and limited in size (~5MB). Large datasets will slow down the main thread during saves and could eventually fail to persist.
- **Recommendation:** 
  - Implement pagination or virtualization for the `ExpenseList` if users exceed ~200 items.
  - Consider migrating to `IndexedDB` for storage if the app is intended for heavy multi-year usage.

## 3. Storage Resilience (Local Storage)
**Status: ✅ Resilient**

- **Analysis:** The `useLocalStorage` hook includes `try-catch` blocks for both reading and writing. This prevents the app from crashing if:
  - The browser blocks third-party cookies/storage.
  - The storage quota is exceeded.
  - Data is corrupted (though `JSON.parse` errors are caught).
- **Edge Case:** If `localStorage` fails, the app still works in-memory but data won't persist after refresh.

## 4. Zero-Expense States
**Status: ✅ Handled**

- **Analysis:**
  - `ExpenseList` displays a friendly empty state with a "Seed Demo Data" button.
  - `DonutChart` renders a placeholder gray circle and prevents division-by-zero errors in percentage calculations.
  - `BarChart` scales to a default threshold ($100) if no expenses exist, preventing a collapsed or broken SVG.

## 5. Data Integrity & Type Safety
**Status: ⚠️ Minor Risk**

- **Category Typos:** Categories are strictly typed as `Category` (food, transport, data, fun, other). The UI uses a button grid for selection, preventing manual typos. However, data loaded from `localStorage` isn't currently validated against the schema.
- **Currency Assumptions:** The app assumes a single currency (`$`). 
  - **Issue:** The `formatAmount` utility defaults to `$`, and the `ExpenseForm` hardcodes `$` in the label.
  - **Recommendation:** Centralize the currency symbol in a config file or `ExpenseContext` to allow for easy localization.

## 6. Logic Edge Cases
- **Future Dates:** The `ExpenseForm` restricts date selection to "today" or earlier via the `max` attribute. However, users can still manually enter future dates if they bypass the browser picker or if their system clock is incorrect.
- **Negative Amounts:** The `ExpenseForm` uses `min="0.01"` and validation logic to prevent negative or zero values.
- **Timezone Shifts:** The app uses local date construction (`new Date(year, month-1, day)`), which is generally safe for a local dashboard but could show inconsistent "Week Start" dates if a user travels across timezones frequently.

---

### Audit Summary

| Category | Risk Level | Key Finding |
|----------|------------|-------------|
| **XSS** | Low | Protected by React; no `dangerouslySetInnerHTML`. |
| **Performance**| Medium | `localStorage` and O(n) calculations scale poorly. |
| **Persistence**| Low | Good error handling; needs storage quota monitoring. |
| **Edge Cases** | Low | Zero-state and validation are robust. |
| **Localization**| Medium | Hardcoded `$` and English labels. |
