# 01‑Explanation – How the ExpenseScope Dashboard Works (for a 7‑year‑old)

## 📂 What’s in the project?

| Folder | What it contains | Simple description |
|--------|------------------|--------------------|
| **src** | All the code that makes the app run | Think of it as the kitchen where we cook the app.
| **src/types** | Type definitions (like LEGO block shapes) | Tells the rest of the code what an *Expense* looks like.
| **src/utils** | Small helper tricks (date handling, colors, etc.) | Tiny robots that do little jobs for us.
| **src/context** | Central store called *ExpenseContext* | A big toolbox where every part of the app can grab the same toys.
| **src/hooks** | `useLocalStorage` custom hook | A secret drawer that saves data in the browser.
| **src/components** | UI pieces (forms, lists, charts, tabs) | The visible parts you see on the screen.
| **src/index.css** | Global styling variables | The paint‑bucket that gives the app its colors and glow.
| **src/App.tsx** | Main entry point | The front door that opens the dashboard.

---

## 🔧 How data moves around (the “story”)?

1. **Start‑up** – When the app first loads, `ExpenseProvider` (in *ExpenseContext.tsx*) runs.
   - It asks the *local‑storage* hook if we already have saved expenses.
   - If nothing is there, it creates a **demo data** list – a few pretend purchases.
2. **Saving & Loading** – The hook `useLocalStorage` reads/writes a JSON string under the key `expensescope_expenses`.  Think of it as a magical notebook that stays in the browser.
3. **Adding a new expense** – The *ExpenseForm* component collects description, amount, category, and date, then calls `addExpense` from the context. The new expense gets a unique id and is stored in the notebook.
4. **Filtering** – The *FilterTabs* component lets you pick **This Week**, **Last Week**, or **All Time**. The context watches the selected filter and creates a **filtered list** of expenses.
6. **Charts** – Two components read the filtered list:
   - **DonutChart** shows how much each category (food, transport, …) contributed to the total.
   - **BarChart** shows how much was spent each day for the last 7 days.
7. **Displaying** – `ExpenseList` just prints every expense in a simple table. `SummaryCards` shows totals for the whole week and the filtered range.
8. **All together** – `App.tsx` wraps everything in `<ExpenseProvider>` and arranges the layout (header, tabs, form‑+list on the left, charts on the right).

---

## 🧠 How the Brain Works (The Logic)

### 1. Filtering without breaking things (The Magic Tray)
Imagine you have a big treasure chest full of all your receipts. When you want to see only the receipts from *this week*, you don't throw away the old ones! Instead, you use a **Magic Tray**. 
- You ask the tray to only show you the receipts that match "This Week." 
- The tray makes a copy of those receipts for you to look at.
- All your original receipts stay safe and sound in the treasure chest. 
This way, you can look at different groups of receipts without ever losing or breaking the original list!

### 2. Derived State (The Busy Counting Robot)
We have a very fast robot friend called `useMemo`. This robot loves to count! Every time you add a new receipt to your chest, the robot wakes up and quickly recalculates everything.
- It counts the total money.
- It groups things into piles (Food pile, Toy pile, etc.).
- It checks which day had the most spending.
Because the robot is so fast, the dashboard always shows the right numbers the very second you add something new. You don't have to do any math yourself; the robot does it all for you!

### 3. How the Charts Get Their Data (Magic Picture Books)
The charts are like magic picture books that update themselves by listening to the Counting Robot.
- **The Donut Chart** is like a pizza. It asks the robot, "How big should the *Food* slice be?" The robot tells it the percentage, and the pizza slice grows or shrinks to match.
- **The Bar Chart** is like building block towers. It asks the robot, "How many blocks high should *Wednesday's* tower be?" 
The charts don't look at the big chest of receipts directly. They just wait for the Counting Robot to tell them the final numbers so they can draw the pretty pictures.

---

## 📅 Date helpers – tiny robots


| Function | What it does (in kid language) |
|----------|--------------------------------|
| `parseLocalDate` | Turns a text like `2026‑05‑21` into a real calendar day that the computer can count.
| `formatLocalDate` | Takes a calendar day and turns it back into the text you see in the date picker.
| `getStartOfWeek` | Finds the Monday of the week you’re looking at.
| `isInThisWeek` / `isInLastWeek` | Checks if a given day belongs to this week or the previous week.
| `getLast7Days` | Gives a list of the last seven dates (including today).
| `formatDateLabel` | Turns a date into friendly words like **Today**, **Yesterday**, or **Mon**.
| `formatAmount` | Makes numbers look like money – `$12.34`.

---

## 🧩 Components – building blocks

- **FilterTabs** – little buttons that you click to change the time‑range.
- **SummaryCards** – big cards that show total money spent.
- **ExpenseForm** – the form where you type a description, amount, pick a category (with colourful icons) and choose a date.
- **ExpenseList** – a simple list of all the expenses you added.
- **DonutChart** – a round picture (like a pizza) that shows each category’s slice.
- **BarChart** – a set of vertical bars that show daily spending.

All components use **CSS‑in‑JS** (`<style>{`…`}</style>`) to give them smooth animations, gradients, and a glass‑morphism “glow” effect.

---

## 🎨 Styling – the look‑and‑feel

- **CSS variables** (like `--primary`, `--bg-input`) are defined in `index.css`. Changing one variable changes the whole app’s colour scheme.
- **Glass‑morphism**: cards have a semi‑transparent background with a subtle blur and a faint glow.
- **Micro‑animations**: elements fade‑in, buttons lift a tiny bit on hover, and the donut slice slides gently when you switch tabs.
- **Responsive grid**: on small screens the two columns stack so it still looks good on a phone.

---

## ⚠️ Edge cases we thought about

| Situation | How we protect the app |
|-----------|-----------------------|
| **Future dates** – user tries to pick a date in the future. | The `<input type="date">` has `max={todayStr}` so you can’t pick a later day.
| **Empty description or amount** – user forgets to fill something. | `ExpenseForm` validates and shows a red error banner.
| **Zero or negative amount** – nonsense money. | Validation forces amount > 0.
| **No expenses at all** – first load empty. | The demo‑data seeder automatically puts some tasty sample expenses.
| **Local‑storage quota exceeded** – too much data. | In practice the app only stores a few dozen items, far below the browser limit, and we catch errors when reading/writing.
| **Wrong category** – if a new category is added later. | `CATEGORY_CONFIG` maps every known category; unknown ones fall back to the `other` style.
| **Time‑zone shifts** – midnight moving sideways on daylight‑saving. | We always use the *local* `Date` constructor (`new Date(year, month‑1, day)`) which respects the user’s current time‑zone.

---

## 📦 How the whole thing fits together (the “big picture”)

```
┌─────────────────────────────────────┐
│               App.tsx               │
│   (wraps everything in Provider)   │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│          ExpenseProvider (context)   │
│  – holds expenses array, filter state │
│  – calculates aggregates for charts   │
└─────────────────────────────────────┘
   │          │          │          │
   ▼          ▼          ▼          ▼
Form │ List │ Charts │ Summary
│        │        │        │
│        │        │        │
│        ▼        ▼        ▼
│   (uses utils/dateHelpers.ts
│    and utils/categoryConfig.ts)
└─────────────────────────────────────┘
```

Each piece talks to the **central store** (the context). That way every component always sees the same up‑to‑date information.

---

## 🚀 Running the app

1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
3. Open the browser at `http://localhost:5173` – you’ll see the dashboard!
4. Add, delete, or clear expenses. All changes stay in the browser even if you refresh the page.

---

## 📚 Where to look for more details

- **Types** – `src/types/index.ts` defines the shapes of *Expense*, *Category*, and *TimeFilter*.
- **Date logic** – `src/utils/dateHelpers.ts`.
- **Color & icons** – `src/utils/categoryConfig.ts`.
- **State & logic** – `src/context/ExpenseContext.tsx`.
- **Persistence** – `src/hooks/useLocalStorage.ts`.
- **UI** – all files under `src/components/`.
- **Styling** – `src/index.css` and the inline `<style>` blocks inside each component.

---

### 🎉 That’s it!
You now have a simple, colourful expense dashboard that stores data locally, shows nice charts, and works on both desktop and mobile. Feel free to play with the code – change colors, add new categories, or tweak the charts. Have fun building!
