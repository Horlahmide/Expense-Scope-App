import React from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import type { TimeFilter } from '../../types';

interface TabItem {
  id: TimeFilter;
  label: string;
}

export const FilterTabs: React.FC = () => {
  const { filter, setFilter } = useExpenses();

  const tabs: TabItem[] = [
    { id: 'this-week', label: 'This Week' },
    { id: 'last-week', label: 'Last Week' },
    { id: 'all-time', label: 'All Time' },
  ];

  return (
    <div className="filter-tabs-wrapper">
      <div className="tabs-container">
        {tabs.map((tab) => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`tab-btn ${isActive ? 'active' : ''}`}
            >
              {tab.label}
              {isActive && <span className="active-indicator" />}
            </button>
          );
        })}
      </div>

      <style>{`
        .filter-tabs-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        .tabs-container {
          background-color: var(--bg-input);
          border: 1px solid var(--border-color);
          padding: 4px;
          border-radius: 9999px;
          display: flex;
          gap: 4px;
          position: relative;
          box-shadow: var(--shadow-sm);
        }
        .tab-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          padding: 0.5rem 1.25rem;
          font-size: 0.8125rem;
          font-weight: 700;
          cursor: pointer;
          border-radius: 9999px;
          position: relative;
          z-index: 1;
          transition: color var(--transition-fast);
          display: inline-flex;
          align-items: center;
          outline: none;
        }
        .tab-btn:hover {
          color: var(--text-primary);
        }
        .tab-btn.active {
          color: #fff;
          background: linear-gradient(135deg, var(--primary), #8B5CF6);
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        }
        /* Active sliding effect fallback/animation */
        .tab-btn.active-indicator {
          position: absolute;
          top: 4px;
          bottom: 4px;
          left: 4px;
          border-radius: 9999px;
          background: linear-gradient(135deg, var(--primary), #8B5CF6);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 0;
        }
      `}</style>
    </div>
  );
};
