# 04-Cross-Check: Independent Audit vs. Existing 03-audit.md

This document cross-references every finding from the independent codebase audit against the existing `docs/03-audit.md`, identifies discrepancies, documents missed issues, and provides an updated severity matrix.

---

## 1. Cross-Reference Table

| # | Finding | 03-audit.md Status | Independent Status | Delta |
|---|---------|-------------------|-------------------|-------|
| 1 | XSS / `dangerouslySetInnerHTML` | ✅ Low Risk | ✅ Low Risk | Confirmed |
| 2 | Performance / O(n) scaling | ⚠️ Medium | ⚠️ Medium | Confirmed |
| 3 | localStorage resilience | ✅ Resilient | ⚠️ **Elevated to Medium** | **Discrepancy** — misses stale closure bug (see §2.1) |
| 4 | Zero-expense states | ✅ Handled | ❌ **Elevated to High** | **Discrepancy** — misses critical auto-seed bug that breaks "Clear All Data" (see §2.2) |
| 5 | Category typos | ⚠️ Minor Risk | ✅ Low Risk | Confirmed |
| 6 | Currency assumptions ($) | ⚠️ Minor Risk | 🟡 **Elevated to Medium** | Confirmed — both flag same issue |
| 7 | Future dates | ✅ Mentioned in Edge Cases | ✅ Confirmed | Confirmed |
| 8 | Negative amounts | ✅ Mentioned in Edge Cases | ✅ Confirmed | Confirmed |
| 9 | Timezone shifts | ✅ Mentioned in Edge Cases | ✅ Confirmed | Confirmed |

---

## 2. Discrepancies / Missed Findings in 03-audit.md

### 2.1 Stale Closure in `useLocalStorage.setValue` — **New Finding**
**File:** `src/hooks/useLocalStorage.ts:21-32`
**Risk:** 🟠 Medium

The `setValue` callback captures `storedValue` in its `useCallback` dependency array. When called with a functional updater (e.g., `(prev) => [...prev, item]`), the callback receives the **captured closure value**, not the latest React state. Two rapid `setExpenses(prev => ...)` calls in the same render cycle will produce incorrect results.

**03-audit.md says:** "Storage Resilience: ✅ Resilient" — this only checks the `try-catch` blocks but misses the logic bug inside the hook.

**Impact:** Under rapid successive state updates (e.g., bulk import), the second update will operate on a stale state snapshot, causing data loss.

**Fix:** Move `storedValue` access inside `setStoredValue`'s functional updater form:

```tsx
setStoredValue(prev => {
  const valueToStore = value instanceof Function ? value(prev) : value;
  window.localStorage.setItem(key, JSON.stringify(valueToStore));
  return valueToStore;
});
```

---

### 2.2 Auto-Seed Effect Breaks "Clear All Data" — **New Finding**
**File:** `src/context/ExpenseContext.tsx:134-138`
**Risk:** 🔴 High (Functional Bug)

```tsx
useEffect(() => {
  if (expenses.length === 0) {
    setExpenses(getDemoExpenses());
  }
}, [expenses, setExpenses]);
```

When the user clicks "Clear All Data", `expenses` is set to `[]`. This effect immediately re-seeds the demo data, making the clear button **effectively non-functional**. The UI may flash briefly but the data reappears instantly.

**03-audit.md says:** "Zero-Expense States: ✅ Handled" — it only checks the empty-state UI but misses the fact that the empty state is never actually visible to the user because auto-seed fires first.

**Impact:** Users cannot clear their data. The "Clear All Data" button is a placebo.

**Fix:** Add a "has been manually cleared" flag (e.g., a `useRef`) tracked in state, or remove the auto-seed effect and rely on the manual "Seed Demo Data" button exclusively.

---

### 2.3 No Content Security Policy (CSP) — **New Finding**
**File:** `index.html`
**Risk:** 🟠 Medium

No `<meta http-equiv="Content-Security-Policy">` tag is present. Google Fonts are loaded from an external CDN (`fonts.googleapis.com` in `src/index.css:1`) without CSP protection. If a future feature adds `dangerouslySetInnerHTML`, markdown rendering, or user-provided HTML export, XSS becomes trivial.

**03-audit.md says:** Nothing — CSP is not mentioned anywhere.

**Impact:** Defensive layer missing; no mitigation against script injection if React's escaping is ever bypassed.

---

### 2.4 `setTimeout` Not Cleaned Up on Unmount — **New Finding**
**File:** `src/components/expense/ExpenseForm.tsx:58`
**Risk:** 🟡 Medium

```tsx
setTimeout(() => setSuccess(false), 2000);
```

If the component unmounts before 2 seconds (e.g., user navigates away, the `ExpenseProvider` unmounts), React logs a state-update-on-unmounted-component warning. In React 19's strict mode, this can cause unexpected behavior.

**03-audit.md says:** Nothing — unmount cleanup is not addressed.

**Fix:** Store the timeout ID in a `useRef` and clear it in a `useEffect` cleanup:

```tsx
const successTimer = useRef<ReturnType<typeof setTimeout>>();
// ...
clearTimeout(successTimer.current);
successTimer.current = setTimeout(() => setSuccess(false), 2000);
```

---

### 2.5 `DailySpending` Uses All Expenses, Not Filtered — **New Finding**
**File:** `src/context/ExpenseContext.tsx:222-261`
**Risk:** 🟡 Medium

The bar chart aggregates from the full `expenses` array (line 251), not `filteredExpenses`. While the date ranges don't overlap (different calendar dates for different weeks), the semantic mismatch violates the Single Source of Truth principle documented in `02-principles.md`. A user filtering by "Last Week" expects the chart to reflect only last week's data.

**03-audit.md says:** Nothing — this data-flow inconsistency is not mentioned.

---

### 2.6 Floating-Point Accumulation in Monetary Values — **New Finding**
**Files:** `src/context/ExpenseContext.tsx:161-179`, `src/context/ExpenseContext.tsx:192-198`
**Risk:** 🟡 Medium

Amounts are summed as raw floats. Repeated additions like `0.1 + 0.2` produce `0.30000000000000004`. While `formatAmount` rounds to 2 decimals for display, the `categoryAggregates` raw `amount` values and `currentWeekTotal` / `filteredTotal` can carry floating-point artifacts internally.

**03-audit.md says:** Nothing — floating-point precision is not addressed.

**Fix:** Wrap sums with `Math.round(value * 100) / 100`, or use a `cents`-based integer approach internally.

---

### 2.7 No localStorage Input Validation on Load — **New Finding**
**File:** `src/hooks/useLocalStorage.ts:11`
**Risk:** 🟡 Medium

```tsx
const item = window.localStorage.getItem(key);
return item ? JSON.parse(item) : initialValue;
```

`JSON.parse` blindly casts to `T`. If localStorage is corrupted, manually edited in DevTools, or contains data from a future schema version, malformed expenses (NaN amounts, missing/unknown categories, invalid date strings) silently flow through the app. The `else` clause in `ExpenseContext.tsx:193-197` catches unknown categories, but other fields are unguarded.

**03-audit.md §5 says:** "data loaded from `localStorage` isn't currently validated against the schema" — this is flagged as Minor Risk. **Escalated to Medium** because an invalid `date` or `amount` can cause `parseLocalDate` to produce `Invalid Date` (`dateHelpers.ts:7`), which breaks all date comparison logic silently.

---

### 2.8 Category Label Truncation Assumes Multi-Word Strings — **New Finding**
**Files:**
- `src/components/charts/DonutChart.tsx:38`
- `src/components/charts/DonutChart.tsx:147`
- `src/components/expense/ExpenseForm.tsx:129`
- `src/components/expense/ExpenseList.tsx:60`
- `src/components/dashboard/SummaryCards.tsx:184-193`

**Risk:** 🟢 Low

`config.label.split(' ')[0]` appears in 5 locations. All current labels ("Food & Dining", "Transport & Travel", etc.) are multi-word, but adding a single-word label (e.g., `"Rent"`) would cause the display to be identical to the full label, which is fine functionally but fragile as a pattern.

**03-audit.md says:** Nothing.

---

### 2.9 `useMemoLabel` Is an Unnecessary Optimization — **New Finding**
**File:** `src/components/dashboard/SummaryCards.tsx:183-196`
**Risk:** 🟢 Low

A `switch` statement on a string is O(1) and trivial. Wrapping it in `useMemo` adds more overhead (comparison + closure allocation) than it saves.

**03-audit.md says:** Nothing.

---

### 2.10 Constants Recreated Every Render — **New Finding**
**File:** `src/components/charts/DonutChart.tsx:15`
**Risk:** 🟢 Low

```tsx
const circumference = 2 * Math.PI * radius;
```

`radius` is a module-level constant (line 13). `circumference` should also be module-level or wrapped in `useMemo`. It is recalculated on every render.

**03-audit.md §2 (Performance) says:** Nothing about component-level constant recreation.

---

### 2.11 No Error Boundaries — **New Finding**
**Files:** All component files
**Risk:** 🟡 Medium

A runtime error in any component (e.g., `segments[hoveredIdx]` being undefined despite the `null` check in `DonutChart.tsx`) would crash the entire React tree. No `<ErrorBoundary>` wraps the app in `App.tsx` or `main.tsx`.

**03-audit.md says:** Nothing.

---

### 2.12 No Keyboard Accessibility on Interactive SVGs — **New Finding**
**Files:** `src/components/charts/DonutChart.tsx:118-119`, `src/components/charts/BarChart.tsx:122-123`
**Risk:** 🟢 Low

Chart segments use `onMouseEnter`/`onMouseLeave` but lack `onFocus`/`onBlur` counterparts. Keyboard-only users cannot interact with chart tooltips.

**03-audit.md says:** Nothing — accessibility is not addressed anywhere.

---

### 2.13 Empty `App.css` — **New Finding**
**File:** `src/App.css`
**Risk:** 🟢 Informational

The file is imported in an unknown location (not visible in `App.tsx` or `main.tsx` imports) and contains zero styles. Can be deleted.

**03-audit.md says:** Nothing.

---

## 3. Corrected Risk Matrix

| Category | 03-audit.md Rating | **Cross-Check Rating** | Key Delta |
|----------|:-------------------:|:----------------------:|-----------|
| XSS | Low | **Low** | Confirmed |
| Performance | Medium | **Medium** | Added constant recreation, unnecessary useMemo |
| Persistence | Low | **Medium** | Added stale closure bug in useLocalStorage |
| Edge Cases / Zero-State | Low | **High** | Added critical auto-seed bug breaking "Clear All Data" |
| Localization | Medium | **Medium** | Confirmed |
| Data Validation | Minor | **Medium** | Escalated due to silent Invalid Date propagation |
| CSP / Security Headers | — | **Medium** | **Missed entirely** in 03-audit.md |
| Unmount Cleanup | — | **Medium** | **Missed entirely** — setTimeout leak |
| Floating-Point Precision | — | **Medium** | **Missed entirely** |
| Accessibility | — | Low | **Missed entirely** |
| Error Boundaries | — | Medium | **Missed entirely** |

---

## 4. New Findings Summary (Not in 03-audit.md)

| # | Finding | File(s) | Severity | Type |
|---|---------|---------|----------|------|
| 1 | Auto-seed breaks "Clear All Data" | `ExpenseContext.tsx:134-138` | 🔴 **High** | Logic Bug |
| 2 | Stale closure in `useLocalStorage.setValue` | `useLocalStorage.ts:21-32` | 🟠 Medium | Logic Bug |
| 3 | No CSP in `index.html` | `index.html` | 🟠 Medium | Security Gap |
| 4 | `setTimeout` not cleaned up on unmount | `ExpenseForm.tsx:58` | 🟡 Medium | Resource Leak |
| 5 | Daily chart aggregates from all expenses | `ExpenseContext.tsx:251` | 🟡 Medium | Data Inconsistency |
| 6 | Floating-point monetary accumulation | `ExpenseContext.tsx:161-198` | 🟡 Medium | Precision Bug |
| 7 | No localStorage schema validation | `useLocalStorage.ts:11` | 🟡 Medium | Data Integrity |
| 8 | No Error Boundary | `App.tsx` / `main.tsx` | 🟡 Medium | Crash Resilience |
| 9 | Label split assumes multi-word | 5 component files | 🟢 Low | Fragile Pattern |
| 10 | `useMemoLabel` is unnecessary | `SummaryCards.tsx:183-196` | 🟢 Low | Micro-optimization |
| 11 | Constants recreated on each render | `DonutChart.tsx:15` | 🟢 Low | Micro-performance |
| 12 | No keyboard a11y on chart SVGs | `DonutChart.tsx`, `BarChart.tsx` | 🟢 Low | Accessibility |
| 13 | Empty `App.css` | `App.css` | 🟢 Info | Cleanup |

---

## 5. Findings Confirmed from 03-audit.md

| # | Finding | Original Severity | Cross-Check Verdict |
|---|---------|:-----------------:|:-------------------:|
| 1 | React JSX escaping prevents XSS | Low | ✅ Confirmed |
| 2 | `useMemo` used for derived state | Medium | ✅ Confirmed |
| 3 | `localStorage` try-catch resilience | Low | ✅ Confirmed (but see §2.1 for closure bug) |
| 4 | Zero-state UI (empty list, chart placeholders) | Low | ✅ Confirmed (but see §2.2 for auto-seed bug) |
| 5 | Category button grid prevents typos | Minor | ✅ Confirmed |
| 6 | Hardcoded `$` currency | Minor | ✅ Confirmed & escalated |
| 7 | Future date blocked via `max` attribute | — | ✅ Confirmed |
| 8 | Negative amount validation | — | ✅ Confirmed |
| 9 | Local date construct avoids TZ issues | — | ✅ Confirmed |
| 10 | Unknown category fallback to "other" | — | ✅ Confirmed |

---

## 6. Recommendations (Priority-Ordered)

1. **Fix auto-seed effect** — Add a `useRef` flag to skip re-seeding after explicit user clear action.
2. **Fix stale closure** — Move `storedValue` access inside `setStoredValue`'s functional updater.
3. **Add CSP** — Add `<meta http-equiv="Content-Security-Policy">` to `index.html` with at minimum `default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com`.
4. **Clean up `setTimeout`** — Use `useRef` + `clearTimeout` in a `useEffect` cleanup.
5. **Fix daily chart data source** — Change `expenses` to `filteredExpenses` in `dailySpending` computation.
6. **Add rounding** — Round monetary sums to 2 decimal places after each aggregation.
7. **Validate loaded data** — Add a runtime schema validator for expenses loaded from localStorage.
8. **Add Error Boundary** — Wrap the app or individual dashboard sections.
9. **Centralize currency** — Extract `$` into a config constant.
10. **Remove empty `App.css`** — Delete unused file.

---

*Generated from independent codebase cross-check audit. Complements and supersedes `03-audit.md` with 13 new findings.*
