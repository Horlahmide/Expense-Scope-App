import React from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { CATEGORY_CONFIG } from '../../utils/categoryConfig';
import { formatDateLabel, formatAmount } from '../../utils/dateHelpers';

export const ExpenseList: React.FC = () => {
  const { filteredExpenses, deleteExpense, loadDemoData } = useExpenses();

  // Sort expenses newest first
  const sortedExpenses = React.useMemo(() => {
    return [...filteredExpenses].sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredExpenses]);

  return (
    <div className="glass-card expense-list-card animate-fade-in animation-delay-1">
      <div className="list-header flex-between">
        <h2 className="list-title">Recent Transactions</h2>
        <span className="list-count">{filteredExpenses.length} total</span>
      </div>

      {sortedExpenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-wrapper">
            <svg viewBox="0 0 24 24" className="empty-icon"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 14h6m-6 4h6m3 4H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9l5 5v13a2 2 0 0 1-2 2Z"/></svg>
          </div>
          <p className="empty-heading">No transactions found</p>
          <p className="empty-text">No expenses have been recorded for this timeframe. Add one above or load demo data to view charts.</p>
          <button onClick={loadDemoData} className="btn btn-secondary btn-sm empty-btn">
            ⚡ Seed Demo Data
          </button>
        </div>
      ) : (
        <div className="list-scroll-container">
          <div className="transaction-list">
            {sortedExpenses.map((exp) => {
              const config = CATEGORY_CONFIG[exp.category];
              return (
                <div key={exp.id} className="transaction-item">
                  <div className="item-left">
                    {/* Category Icon Badge */}
                    <div
                      className="category-icon-badge"
                      style={{
                        backgroundColor: config.bgLight,
                        color: config.color,
                      }}
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5">
                        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d={config.iconPath}/>
                      </svg>
                    </div>

                    <div className="item-details">
                      <span className="item-description">{exp.description}</span>
                      <div className="item-meta">
                        <span
                          className="item-category-label"
                          style={{ color: config.color }}
                        >
                          {config.label.split(' ')[0]}
                        </span>
                        <span className="dot">•</span>
                        <span className="item-date">{formatDateLabel(exp.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="item-right">
                    <span className="item-amount">{formatAmount(exp.amount)}</span>
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="btn-delete"
                      aria-label="Delete expense"
                    >
                      <svg viewBox="0 0 24 24" className="delete-icon"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        .expense-list-card {
          width: 100%;
          display: flex;
          flex-direction: column;
          max-height: 480px;
        }
        .list-header {
          margin-bottom: 1rem;
        }
        .list-title {
          font-size: 1.125rem;
          font-weight: 800;
          background: linear-gradient(135deg, #FFF, var(--text-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .list-count {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          background-color: var(--bg-input);
          padding: 0.25rem 0.625rem;
          border-radius: 9999px;
          border: 1px solid var(--border-color);
        }
        .list-scroll-container {
          overflow-y: auto;
          margin-right: -0.5rem;
          padding-right: 0.5rem;
        }
        .transaction-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .transaction-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid transparent;
          transition: all var(--transition-fast);
        }
        .transaction-item:hover {
          background: rgba(255, 255, 255, 0.02);
          border-color: var(--border-color);
          transform: translateX(2px);
        }
        .item-left {
          display: flex;
          align-items: center;
          gap: 0.875rem;
        }
        .category-icon-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          flex-shrink: 0;
        }
        .item-details {
          display: flex;
          flex-direction: column;
        }
        .item-description {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.3;
        }
        .item-meta {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.125rem;
        }
        .item-category-label {
          font-weight: 700;
          text-transform: capitalize;
        }
        .dot {
          color: var(--text-muted);
        }
        .item-date {
          font-weight: 500;
        }
        .item-right {
          display: flex;
          align-items: center;
          gap: 0.875rem;
        }
        .item-amount {
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .btn-delete {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.375rem;
          border-radius: 6px;
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.4;
        }
        .transaction-item:hover .btn-delete {
          opacity: 0.8;
        }
        .btn-delete:hover {
          color: var(--danger);
          background-color: var(--danger-glow);
          opacity: 1 !important;
        }
        .delete-icon {
          width: 14px;
          height: 14px;
        }
        /* Empty State */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 2.5rem 1.5rem;
        }
        .empty-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          margin-bottom: 1rem;
        }
        .empty-icon {
          width: 24px;
          height: 24px;
        }
        .empty-heading {
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.375rem;
        }
        .empty-text {
          font-size: 0.75rem;
          color: var(--text-muted);
          max-width: 240px;
          line-height: 1.5;
          margin-bottom: 1.25rem;
        }
        .btn-sm {
          padding: 0.5rem 1rem !important;
          font-size: 0.75rem !important;
        }
        .empty-btn:hover {
          color: var(--primary) !important;
          border-color: var(--primary) !important;
        }
      `}</style>
    </div>
  );
};
