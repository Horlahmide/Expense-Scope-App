import React, { createContext, useContext, useMemo, useState } from "react";
import type { Expense, Category, TimeFilter } from "../types";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  isInThisWeek,
  isInLastWeek,
  getLast7Days,
  getStartOfWeek,
  formatLocalDate,
  parseLocalDate,
} from "../utils/dateHelpers";
import { CATEGORY_CONFIG } from "../utils/categoryConfig";

export interface CategoryAggregate {
  category: Category;
  label: string;
  amount: number;
  percentage: number;
  color: string;
  gradient: [string, string];
}

export interface DailySpend {
  date: string;
  label: string; // "Mon", "Tue", etc.
  amount: number;
}

interface ExpenseContextType {
  expenses: Expense[];
  filteredExpenses: Expense[];
  filter: TimeFilter;
  setFilter: (filter: TimeFilter) => void;
  addExpense: (expense: Omit<Expense, "id">) => void;
  deleteExpense: (id: string) => void;
  clearAllExpenses: () => void;
  loadDemoData: () => void;
  currentWeekTotal: number;
  filteredTotal: number;
  dailySpending: DailySpend[];
  categoryAggregates: CategoryAggregate[];
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

// Validator for local storage data
const isValidExpenseArray = (data: any): data is Expense[] => {
  if (!Array.isArray(data)) return false;
  return data.every(
    (item) =>
      typeof item.id === "string" &&
      typeof item.amount === "number" &&
      ["food", "transport", "data", "fun", "other"].includes(item.category) &&
      typeof item.date === "string" &&
      !isNaN(Date.parse(item.date)) &&
      typeof item.description === "string",
  );
};

// Generate realistic seed data relative to the current local time
const getDemoExpenses = (): Expense[] => {
  const ref = new Date();
  const getOffsetDateStr = (daysOffset: number): string => {
    const d = new Date(ref);
    d.setDate(ref.getDate() - daysOffset);
    return formatLocalDate(d);
  };

  return [
    {
      id: "demo-1",
      amount: 45.5,
      category: "food",
      date: getOffsetDateStr(0), // Today
      description: "Sushi lunch with team",
    },
    {
      id: "demo-2",
      amount: 12.0,
      category: "transport",
      date: getOffsetDateStr(0), // Today
      description: "Uber ride home",
    },
    {
      id: "demo-3",
      amount: 75.0,
      category: "data",
      date: getOffsetDateStr(1), // Yesterday
      description: "Monthly internet subscription",
    },
    {
      id: "demo-4",
      amount: 28.0,
      category: "fun",
      date: getOffsetDateStr(2), // 2 days ago
      description: "Cinema ticket & snacks",
    },
    {
      id: "demo-5",
      amount: 18.9,
      category: "food",
      date: getOffsetDateStr(3), // 3 days ago
      description: "Breakfast coffee & pastry",
    },
    {
      id: "demo-6",
      amount: 92.5,
      category: "food",
      date: getOffsetDateStr(4), // 4 days ago
      description: "Weekly grocery shopping",
    },
    {
      id: "demo-7",
      amount: 35.0,
      category: "transport",
      date: getOffsetDateStr(5), // 5 days ago
      description: "Gas station fuel refill",
    },
    {
      id: "demo-8",
      amount: 120.0,
      category: "fun",
      date: getOffsetDateStr(8), // 8 days ago (Last Week)
      description: "Weekend concert tickets",
    },
    {
      id: "demo-9",
      amount: 15.5,
      category: "other",
      date: getOffsetDateStr(10), // 10 days ago (Last Week)
      description: "Sticky notes & pens",
    },
    {
      id: "demo-10",
      amount: 250.0,
      category: "other",
      date: getOffsetDateStr(15), // 15 days ago (Older)
      description: "Ergonomic office chair",
    },
  ];
};

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>(
    "expensescope_expenses",
    [],
    isValidExpenseArray,
  );
  const [filter, setFilter] = useState<TimeFilter>("this-week");

  const addExpense = (newExpense: Omit<Expense, "id">) => {
    const expenseWithId: Expense = {
      ...newExpense,
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setExpenses((prev) => [expenseWithId, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  const clearAllExpenses = () => {
    setExpenses([]);
  };

  const loadDemoData = () => {
    setExpenses(getDemoExpenses());
  };

  // 1. Calculate current week's total (always relative to "this-week" regardless of active filter)
  const currentWeekTotal = useMemo(() => {
    const rawTotal = expenses
      .filter((exp) => isInThisWeek(exp.date))
      .reduce((sum, exp) => sum + exp.amount, 0);
    return Math.round(rawTotal * 100) / 100;
  }, [expenses]);

  // 2. Filter expenses based on the selected TimeFilter
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      if (filter === "this-week") return isInThisWeek(exp.date);
      if (filter === "last-week") return isInLastWeek(exp.date);
      return true; // all-time
    });
  }, [expenses, filter]);

  // 3. Total spend for the active filter
  const filteredTotal = useMemo(() => {
    const rawTotal = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    return Math.round(rawTotal * 100) / 100;
  }, [filteredExpenses]);

  // 4. Calculate category aggregation (for Donut Chart)
  const categoryAggregates = useMemo((): CategoryAggregate[] => {
    const totals: Record<Category, number> = {
      food: 0,
      transport: 0,
      data: 0,
      fun: 0,
      other: 0,
    };

    // Calculate sum per category
    filteredExpenses.forEach((exp) => {
      if (totals[exp.category] !== undefined) {
        totals[exp.category] += exp.amount;
      } else {
        totals.other += exp.amount;
      }
    });

    // Round category totals
    (Object.keys(totals) as Category[]).forEach((cat) => {
      totals[cat] = Math.round(totals[cat] * 100) / 100;
    });

    const totalSpend = Object.values(totals).reduce((sum, val) => sum + val, 0);
    const roundedTotalSpend = Math.round(totalSpend * 100) / 100;

    return (Object.keys(totals) as Category[])
      .map((cat) => {
        const amount = totals[cat];
        const percentage =
          roundedTotalSpend > 0 ? (amount / roundedTotalSpend) * 100 : 0;
        const config = CATEGORY_CONFIG[cat];
        return {
          category: cat,
          label: config.label,
          amount,
          percentage,
          color: config.color,
          gradient: config.gradient,
        };
      })
      .sort((a, b) => b.amount - a.amount); // Order by highest spending first
  }, [filteredExpenses]);

  // 5. Calculate daily spending (for Bar Chart)
  // Shows 7 days based on context filter:
  // - 'this-week': Monday to Sunday of the current week
  // - 'last-week': Monday to Sunday of the previous week
  // - 'all-time': Rolling last 7 days ending today
  const dailySpending = useMemo((): DailySpend[] => {
    let targetDates: string[] = [];
    const refDate = new Date();

    if (filter === "this-week") {
      const mon = getStartOfWeek(refDate);
      for (let i = 0; i < 7; i++) {
        const d = new Date(mon);
        d.setDate(mon.getDate() + i);
        targetDates.push(formatLocalDate(d));
      }
    } else if (filter === "last-week") {
      const thisMon = getStartOfWeek(refDate);
      const prevMon = new Date(thisMon);
      prevMon.setDate(thisMon.getDate() - 7);
      for (let i = 0; i < 7; i++) {
        const d = new Date(prevMon);
        d.setDate(prevMon.getDate() + i);
        targetDates.push(formatLocalDate(d));
      }
    } else {
      // 'all-time' -> rolling last 7 days ending today
      targetDates = getLast7Days(refDate);
    }

    return targetDates.map((dateStr) => {
      const dayDate = parseLocalDate(dateStr);
      // Weekday label
      const label = dayDate.toLocaleDateString(undefined, { weekday: "short" });
      const rawAmount = filteredExpenses
        .filter((exp) => exp.date === dateStr)
        .reduce((sum, exp) => sum + exp.amount, 0);

      return {
        date: dateStr,
        label,
        amount: Math.round(rawAmount * 100) / 100,
      };
    });
  }, [filteredExpenses, filter]);

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        filteredExpenses,
        filter,
        setFilter,
        addExpense,
        deleteExpense,
        clearAllExpenses,
        loadDemoData,
        currentWeekTotal,
        filteredTotal,
        dailySpending,
        categoryAggregates,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpenses must be used within an ExpenseProvider");
  }
  return context;
};
