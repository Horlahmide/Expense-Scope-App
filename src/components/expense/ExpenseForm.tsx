import React, { useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import type { Category } from '../../types';
import { CATEGORY_CONFIG } from '../../utils/categoryConfig';
import { formatLocalDate } from '../../utils/dateHelpers';

export const ExpenseForm: React.FC = () => {
  const { addExpense, clearAllExpenses, loadDemoData, expenses } = useExpenses();

  const todayStr = formatLocalDate(new Date());

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('food');
  const [date, setDate] = useState(todayStr);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!description.trim()) {
      setError('Please enter a description.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    if (!date) {
      setError('Please select a date.');
      return;
    }

    // Process submission
    addExpense({
      description: description.trim(),
      amount: parsedAmount,
      category,
      date,
    });

    // Reset Form
    setDescription('');
    setAmount('');
    setCategory('food');
    setDate(todayStr);
    
    // Trigger temporary visual success feedback
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div className="glass-card expense-form-card animate-fade-in">
      <h2 className="form-title">Add Expense</h2>
      
      <form onSubmit={handleSubmit} className="form-body">
        {error && <div className="error-banner">{error}</div>}
        {success && <div className="success-banner">Expense logged successfully!</div>}

        <div className="form-group">
          <label htmlFor="description" className="form-label">Description</label>
          <input
            id="description"
            type="text"
            className="form-input"
            placeholder="e.g. Starbucks Latte"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="amount" className="form-label">Amount ($)</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              className="form-input"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="date" className="form-label">Date</label>
            <input
              id="date"
              type="date"
              className="form-input"
              value={date}
              max={todayStr} // Prevent logging future dates by default if required, or remove
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="category" className="form-label">Category</label>
          <div className="category-select-grid">
            {(Object.keys(CATEGORY_CONFIG) as Category[]).map((cat) => {
              const config = CATEGORY_CONFIG[cat];
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`category-pill-btn ${isSelected ? 'selected' : ''}`}
                  style={{
                    '--cat-color': config.color,
                    '--cat-bg': config.bgLight,
                  } as React.CSSProperties}
                >
                  <svg viewBox="0 0 24 24" className="pill-icon">
                    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={config.iconPath}/>
                  </svg>
                  <span>{config.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-full submit-btn">
          <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14M5 12h14"/></svg>
          Add transaction
        </button>
      </form>

      {/* Database utilities footer */}
      <div className="db-controls">
        {expenses.length === 0 ? (
          <button onClick={loadDemoData} className="btn-link">
            ⚡ Seed Dashboard Demo Data
          </button>
        ) : (
          <button onClick={clearAllExpenses} className="btn-link text-danger-btn">
            ⚠️ Clear All Data
          </button>
        )}
      </div>

      <style>{`
        .expense-form-card {
          width: 100%;
        }
        .form-title {
          font-size: 1.125rem;
          font-weight: 800;
          margin-bottom: 1.25rem;
          background: linear-gradient(135deg, #FFF, var(--text-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .form-body {
          display: flex;
          flex-direction: column;
        }
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .error-banner {
          background-color: var(--danger-glow);
          border: 1px solid var(--danger);
          color: #FCA5A5;
          padding: 0.75rem;
          border-radius: 10px;
          font-size: 0.8125rem;
          font-weight: 600;
          margin-bottom: 1.25rem;
          animation: fadeInUp var(--transition-fast) forwards;
        }
        .success-banner {
          background-color: var(--success-glow);
          border: 1px solid var(--success);
          color: #A7F3D0;
          padding: 0.75rem;
          border-radius: 10px;
          font-size: 0.8125rem;
          font-weight: 600;
          margin-bottom: 1.25rem;
          animation: fadeInUp var(--transition-fast) forwards;
        }
        .category-select-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }
        @media (max-width: 480px) {
          .category-select-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .category-pill-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 0.75rem;
          background-color: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          cursor: pointer;
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 0.75rem;
          font-weight: 600;
          transition: all var(--transition-fast);
          justify-content: flex-start;
        }
        .category-pill-btn:hover {
          border-color: var(--cat-color);
          color: var(--text-primary);
        }
        .category-pill-btn.selected {
          background-color: var(--cat-bg);
          border-color: var(--cat-color);
          color: var(--cat-color);
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.02);
        }
        .pill-icon {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
        }
        .w-full {
          width: 100%;
        }
        .submit-btn {
          margin-top: 0.75rem;
        }
        .db-controls {
          margin-top: 1.25rem;
          padding-top: 1rem;
          border-top: 1px dashed var(--border-color);
          display: flex;
          justify-content: center;
        }
        .btn-link {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: color var(--transition-fast);
        }
        .btn-link:hover {
          color: var(--primary);
        }
        .text-danger-btn:hover {
          color: var(--danger);
        }
        .w-4 { width: 1rem; }
        .h-4 { height: 1rem; }
      `}</style>
    </div>
  );
};
