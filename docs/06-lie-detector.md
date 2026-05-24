# 06-Quiz Results: Architectural Validation

This document records a "4 Truths and a Lie" exercise used to validate the understanding of the ExpenseScope Dashboard's architecture and security.

---

## 1. The Challenge
The following five statements were presented to test knowledge of the codebase:

- **Statement A:** The application uses a custom hook called `useLocalStorage` that includes `try-catch` blocks to prevent the app from crashing if the browser's storage quota is full.
- **Statement B:** The `BarChart` and `DonutChart` components are "purely visual" because they don't calculate any data themselves; they simply receive pre-calculated "aggregates" from the `ExpenseContext`.
- **Statement C:** If a user enters a description like `<script>alert('Hacked')</script>`, the app will execute that script and show an alert box because it doesn't use a sanitization library like DOMPurify.
- **Statement D:** The "Total Spend" number shown in the middle of the Donut Chart changes dynamically when you hover over different category slices.
- **Statement E:** The project avoids "Prop Drilling" by using the React Context API, allowing any component (like `SummaryCards` or `ExpenseList`) to access the expense data directly.

---

## 2. The Verdict
**The Lie was Statement C.**

### Why is it a lie? (Technical Reasoning)
The user correctly identified that **Statement C** is false because React provides built-in protection against Cross-Site Scripting (XSS). 

- **Automatic Escaping:** By default, React escapes all values embedded in JSX before rendering them. This means that any string provided by a user (like a malicious script) is treated as literal text (string) and not as executable HTML/JavaScript.
- **Verification:** An audit of the codebase confirmed that `dangerouslySetInnerHTML`—the only standard way to bypass this protection in React—is not used anywhere in the project.

---

## 3. Confirmation of Truths
The remaining statements correctly describe the project's engineering standards:

- **Persistence (A):** The `useLocalStorage` hook is resilient to browser storage failures.
- **Separation of Concerns (B):** Data processing logic (aggregates) is kept in the Context, keeping the Chart components focused only on rendering SVGs.
- **Interactivity (D):** The `DonutChart` uses local component state to handle hover interactions, providing a dynamic "drill-down" feel to the data.
- **State Management (E):** The `ExpenseContext` acts as a central hub, eliminating the need to pass props through multiple layers of the component tree.

---

## 4. Conclusion
Through this exercise, we confirmed that the application follows modern security best practices and maintains a clean separation between its data management and user interface layers.
