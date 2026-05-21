import React from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { formatAmount } from '../../utils/dateHelpers';

export const SummaryCards: React.FC = () => {
  const { currentWeekTotal, filteredTotal, filteredExpenses, filter } = useExpenses();

  const filterLabel = useMemoLabel(filter);

  const averageSpend = React.useMemo(() => {
    if (filteredExpenses.length === 0) return 0;
    return filteredTotal / filteredExpenses.length;
  }, [filteredExpenses, filteredTotal]);

  return (
    <div className="summary-cards-container">
      {/* Total for Selected Filter */}
      <div className="glass-card summary-card primary-gradient-border animate-fade-in">
        <div className="card-header-flex">
          <span className="card-title">Total Spending</span>
          <div className="icon-badge primary">
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
        </div>
        <div className="card-value gradient-text">{formatAmount(filteredTotal)}</div>
        <div className="card-subtitle">Active range: <span className="highlight">{filterLabel}</span></div>
      </div>

      {/* Total for Current Week */}
      <div className="glass-card summary-card success-gradient-border animate-fade-in animation-delay-1">
        <div className="card-header-flex">
          <span className="card-title">This Week's Spend</span>
          <div className="icon-badge success">
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5v-15Z"/></svg>
          </div>
        </div>
        <div className="card-value text-success">{formatAmount(currentWeekTotal)}</div>
        <div className="card-subtitle">Standard Mon – Sun boundary</div>
      </div>

      {/* Transaction Insights */}
      <div className="glass-card summary-card info-gradient-border animate-fade-in animation-delay-2">
        <div className="card-header-flex">
          <span className="card-title">Insights</span>
          <div className="icon-badge info">
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z"/></svg>
          </div>
        </div>
        <div className="card-value-split">
          <div className="split-item">
            <span className="split-num">{filteredExpenses.length}</span>
            <span className="split-label">Expenses</span>
          </div>
          <div className="split-divider"></div>
          <div className="split-item">
            <span className="split-num">{formatAmount(averageSpend)}</span>
            <span className="split-label">Average</span>
          </div>
        </div>
        <div className="card-subtitle">Aggregated from active filters</div>
      </div>

      <style>{`
        .summary-cards-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        @media (min-width: 640px) {
          .summary-cards-container {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .summary-card {
          position: relative;
          overflow: hidden;
          padding: 1.25rem;
        }
        .card-header-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }
        .card-title {
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .icon-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
        }
        .icon-badge.primary {
          background-color: var(--primary-glow);
          color: var(--primary);
        }
        .icon-badge.success {
          background-color: var(--success-glow);
          color: var(--success);
        }
        .icon-badge.info {
          background-color: rgba(139, 92, 246, 0.15);
          color: #8B5CF6;
        }
        .card-value {
          font-size: 1.625rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
        }
        .card-value-split {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 0.125rem 0 0.5625rem 0;
        }
        .split-item {
          display: flex;
          flex-direction: column;
        }
        .split-num {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .split-label {
          font-size: 0.6875rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
        }
        .split-divider {
          width: 1px;
          height: 24px;
          background-color: var(--border-color);
        }
        .card-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .highlight {
          color: var(--text-primary);
          font-weight: 600;
        }
        .primary-gradient-border::before,
        .success-gradient-border::before,
        .info-gradient-border::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
        }
        .primary-gradient-border::before {
          background: linear-gradient(to bottom, var(--primary), #8B5CF6);
        }
        .success-gradient-border::before {
          background: linear-gradient(to bottom, var(--success), #34D399);
        }
        .info-gradient-border::before {
          background: linear-gradient(to bottom, #8B5CF6, #D946EF);
        }
        .w-5 { width: 1.25rem; }
        .h-5 { height: 1.25rem; }
      `}</style>
    </div>
  );
};

// Helper hook to map filter identifiers to display labels
function useMemoLabel(filter: string) {
  return React.useMemo(() => {
    switch (filter) {
      case 'this-week':
        return 'This Week';
      case 'last-week':
        return 'Last Week';
      case 'all-time':
        return 'All Time';
      default:
        return filter;
    }
  }, [filter]);
}
