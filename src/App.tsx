import React from 'react';
import { ExpenseProvider } from './context/ExpenseContext';
import { FilterTabs } from './components/dashboard/FilterTabs';
import { SummaryCards } from './components/dashboard/SummaryCards';
import { ExpenseForm } from './components/expense/ExpenseForm';
import { ExpenseList } from './components/expense/ExpenseList';
import { DonutChart } from './components/charts/DonutChart';
import { BarChart } from './components/charts/BarChart';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const DashboardContent: React.FC = () => {
  return (
    <main className="app-container">
      {/* Header Panel */}
      <header className="app-header animate-fade-in">
        <div className="brand-logo-title">
          <svg viewBox="0 0 24 24" className="brand-icon">
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
            />
          </svg>
          <h1 className="gradient-brand">ExpenseScope</h1>
        </div>
        <p className="app-subtitle">Personal expense intelligence dashboard</p>
      </header>

      {/* Filter Tabs selection */}
      <FilterTabs />

      {/* Stats summary cards */}
      <SummaryCards />

      {/* Columns grid */}
      <div className="dashboard-grid">
        {/* Left Column: Log Expense & History list */}
        <div className="dashboard-column gap-1-5">
          <ErrorBoundary>
            <ExpenseForm />
          </ErrorBoundary>
          <ErrorBoundary>
            <ExpenseList />
          </ErrorBoundary>
        </div>

        {/* Right Column: Visual analytics charts */}
        <div className="dashboard-column gap-1-5">
          <ErrorBoundary>
            <DonutChart />
          </ErrorBoundary>
          <ErrorBoundary>
            <BarChart />
          </ErrorBoundary>
        </div>
      </div>

      <style>{`
        .app-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 2rem;
        }
        .brand-logo-title {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          margin-bottom: 0.25rem;
        }
        .brand-icon {
          width: 28px;
          height: 28px;
          color: #8B5CF6;
          filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.4));
        }
        .gradient-brand {
          font-size: 2.25rem;
          letter-spacing: -0.03em;
        }
        .app-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }
        .dashboard-column {
          display: flex;
          flex-direction: column;
        }
        .gap-1-5 {
          gap: 1.5rem;
        }
      `}</style>
    </main>
  );
};

export default function App() {
  return (
    <ExpenseProvider>
      <DashboardContent />
    </ExpenseProvider>
  );
}
