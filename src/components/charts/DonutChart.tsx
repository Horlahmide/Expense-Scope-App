import React, { useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { formatAmount } from '../../utils/dateHelpers';

export const DonutChart: React.FC = () => {
  const { categoryAggregates, filteredTotal } = useExpenses();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // SVG parameters
  const size = 200;
  const center = size / 2;
  const radius = 55;
  const strokeWidth = 14;
  const hoveredStrokeWidth = 18;
  const circumference = 2 * Math.PI * radius; // ~345.58

  // Calculate cumulative percentages to position the stroke offsets
  const segments = React.useMemo(() => {
    let accumulatedPercentage = 0;
    return categoryAggregates
      .filter((agg) => agg.amount > 0)
      .map((agg) => {
        const percentage = agg.percentage;
        const strokeLength = (percentage / 100) * circumference;
        // Stroke offset starts at full circumference and moves backward clockwise
        const strokeOffset = circumference - (accumulatedPercentage / 100) * circumference;
        accumulatedPercentage += percentage;
        return {
          ...agg,
          strokeLength,
          strokeOffset,
        };
      });
  }, [categoryAggregates, circumference]);

  // Determine what text to render in the center of the donut
  const centerLabel = hoveredIdx !== null && segments[hoveredIdx]
    ? segments[hoveredIdx].label.split(' ')[0]
    : 'Total Spend';

  const centerValue = hoveredIdx !== null && segments[hoveredIdx]
    ? formatAmount(segments[hoveredIdx].amount)
    : formatAmount(filteredTotal);

  const centerSubtext = hoveredIdx !== null && segments[hoveredIdx]
    ? `${segments[hoveredIdx].percentage.toFixed(0)}%`
    : 'Active Period';

  return (
    <div className="glass-card chart-card donut-card animate-fade-in">
      <h2 className="chart-title">Spending by Category</h2>

      <div className="donut-content-wrapper">
        {/* SVG Container */}
        <div className="svg-container">
          <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%">
            <defs>
              {/* Category gradients for SVG strokes */}
              {segments.map((seg) => (
                <linearGradient key={`grad-${seg.category}`} id={`grad-${seg.category}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={seg.gradient[0]} />
                  <stop offset="100%" stopColor={seg.gradient[1]} />
                </linearGradient>
              ))}
              {/* Glow filter for hovered segment */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Empty base circle track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="rgba(255, 255, 255, 0.03)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* If no data, render a simple gray placeholder segment */}
            {segments.length === 0 && (
              <circle
                cx={center}
                cy={center}
                r={radius}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
            )}

            {/* Main Segment Arcs */}
            <g transform={`rotate(-90 ${center} ${center})`}>
              {segments.map((seg, idx) => {
                const isHovered = hoveredIdx === idx;
                const isAnyHovered = hoveredIdx !== null;
                const opacity = isAnyHovered && !isHovered ? 0.35 : 1;
                
                return (
                  <circle
                    key={seg.category}
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={`url(#grad-${seg.category})`}
                    strokeWidth={isHovered ? hoveredStrokeWidth : strokeWidth}
                    strokeDasharray={`${seg.strokeLength} ${circumference}`}
                    strokeDashoffset={seg.strokeOffset}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{
                      transition: 'stroke-width 0.25s cubic-bezier(0.4, 0, 0.2, 1), stroke-width var(--transition-fast), opacity var(--transition-fast)',
                      opacity,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    filter={isHovered ? 'url(#glow)' : undefined}
                  />
                );
              })}
            </g>
          </svg>

          {/* Centered labels inside the donut */}
          <div className="donut-center-text">
            <span className="center-label">{centerLabel}</span>
            <span className="center-value">{centerValue}</span>
            <span className="center-subtext">{centerSubtext}</span>
          </div>
        </div>

        {/* Chart Legend list */}
        <div className="donut-legend">
          {categoryAggregates.map((agg) => {
            const hasAmount = agg.amount > 0;
            return (
              <div
                key={agg.category}
                className={`legend-item ${!hasAmount ? 'disabled' : ''}`}
                style={{ '--legend-color': agg.color } as React.CSSProperties}
              >
                <div className="legend-indicator-wrapper">
                  <span className="legend-dot"></span>
                  <span className="legend-name">{agg.label.split(' ')[0]}</span>
                </div>
                <div className="legend-values">
                  <span className="legend-amount">{formatAmount(agg.amount)}</span>
                  {hasAmount && (
                    <span className="legend-percent">{agg.percentage.toFixed(0)}%</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .donut-card {
          width: 100%;
        }
        .chart-title {
          font-size: 1.125rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, #FFF, var(--text-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .donut-content-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }
        @media (min-width: 640px) {
          .donut-content-wrapper {
            flex-direction: row;
            justify-content: space-around;
            gap: 2rem;
          }
        }
        .svg-container {
          position: relative;
          width: 190px;
          height: 190px;
          flex-shrink: 0;
        }
        .donut-center-text {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          text-align: center;
          padding: 1rem;
        }
        .center-label {
          font-size: 0.6875rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .center-value {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0.125rem 0;
          word-break: break-all;
          max-width: 130px;
        }
        .center-subtext {
          font-size: 0.6875rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .donut-legend {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
          flex-grow: 1;
          width: 100%;
          max-width: 260px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.8125rem;
          font-weight: 600;
        }
        .legend-item.disabled {
          opacity: 0.3;
        }
        .legend-indicator-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--legend-color);
          box-shadow: 0 0 6px var(--legend-color);
        }
        .legend-name {
          color: var(--text-primary);
        }
        .legend-values {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }
        .legend-amount {
          color: var(--text-secondary);
        }
        .legend-percent {
          font-size: 0.6875rem;
          background-color: var(--bg-input);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          padding: 0.125rem 0.375rem;
          border-radius: 4px;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};
