import React, { useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { formatAmount, formatDateLabel } from '../../utils/dateHelpers';
import { APP_CONFIG } from '../../utils/categoryConfig';

export const BarChart: React.FC = () => {
  const { dailySpending } = useExpenses();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // SVG Dimension Constants
  const viewBoxWidth = 500;
  const viewBoxHeight = 220;
  
  // Padding & graph boundaries
  const paddingBottom = 35;
  const paddingTop = 20;
  const chartHeight = viewBoxHeight - paddingTop - paddingBottom; // 165
  const chartWidth = viewBoxWidth - 30; // 470
  
  const baselineY = viewBoxHeight - paddingBottom; // 185

  // Find max daily amount to scale bars proportionally
  const maxAmount = React.useMemo(() => {
    const maxVal = Math.max(...dailySpending.map((d) => d.amount), 0);
    // Keep a minimum threshold so chart has vertical space if all is 0
    return maxVal > 0 ? maxVal * 1.15 : 100;
  }, [dailySpending]);

  return (
    <div className="glass-card chart-card bar-card animate-fade-in animation-delay-1">
      <div className="flex-between chart-header">
        <h2 className="chart-title">Daily Activity</h2>
        <span className="chart-legend-indicator">Last 7 Days</span>
      </div>

      <div className="bar-chart-container">
        {/* Interactive hover tooltip portal */}
        {hoveredIdx !== null && dailySpending[hoveredIdx] && (
          <div
            className="bar-tooltip animate-fade-in"
            style={{
              left: `${((hoveredIdx + 0.5) / 7) * 100}%`,
              bottom: `${(dailySpending[hoveredIdx].amount / maxAmount) * 110 + 55}px`,
            }}
          >
            <span className="tooltip-date">{formatDateLabel(dailySpending[hoveredIdx].date)}</span>
            <span className="tooltip-amount">{formatAmount(dailySpending[hoveredIdx].amount)}</span>
          </div>
        )}

        <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} width="100%" height="100%">
          <defs>
            {/* Gradient fill for bars */}
            <linearGradient id="barGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>
            <linearGradient id="barGradHover" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#D946EF" />
            </linearGradient>
            {/* Glow drop-shadow filter */}
            <filter id="barGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Reference Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const yVal = baselineY - ratio * chartHeight;
            const gridVal = ratio * maxAmount;
            return (
              <g key={`grid-${ratio}`}>
                <line
                  x1="20"
                  y1={yVal}
                  x2={chartWidth + 20}
                  y2={yVal}
                  stroke="rgba(255, 255, 255, 0.04)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                {ratio > 0 && ratio < 1 && (
                  <text
                    x={chartWidth + 25}
                    y={yVal + 3}
                    fill="var(--text-muted)"
                    fontSize="9"
                    fontWeight="600"
                    textAnchor="start"
                  >
                    {APP_CONFIG.currencySymbol}{gridVal.toFixed(0)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Core Daily Columns */}
          {dailySpending.map((day, idx) => {
            const barWidth = 28;
            // X position calculations
            const spacePerBar = chartWidth / 7;
            const barX = 20 + idx * spacePerBar + (spacePerBar - barWidth) / 2;

            // Height proportions
            const barHeight = day.amount > 0 ? (day.amount / maxAmount) * chartHeight : 4; // Min size of 4px so we have a indicator dot/line
            const barY = baselineY - barHeight;

            const isHovered = hoveredIdx === idx;

            return (
              <g key={day.date}>
                {/* Invisible hover-capture pillar (wide area for easier touch/hover interaction) */}
                <rect
                  x={20 + idx * spacePerBar}
                  y={paddingTop}
                  width={spacePerBar}
                  height={chartHeight + 10}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />

                {/* Animated visual column */}
                <rect
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  rx="6"
                  ry="6"
                  fill={isHovered ? 'url(#barGradHover)' : 'url(#barGrad)'}
                  style={{
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    pointerEvents: 'none',
                    opacity: day.amount > 0 ? 1 : 0.25,
                  }}
                  filter={isHovered ? 'url(#barGlow)' : undefined}
                />

                {/* X-Axis labels */}
                <text
                  x={barX + barWidth / 2}
                  y={viewBoxHeight - 12}
                  fill={isHovered ? 'var(--text-primary)' : 'var(--text-muted)'}
                  fontSize="10"
                  fontWeight="700"
                  textAnchor="middle"
                  style={{
                    transition: 'color var(--transition-fast)',
                    pointerEvents: 'none',
                  }}
                >
                  {day.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <style>{`
        .bar-card {
          width: 100%;
        }
        .chart-header {
          margin-bottom: 1.25rem;
        }
        .chart-legend-indicator {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 700;
        }
        .bar-chart-container {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 180px;
        }
        /* Floating CSS Tooltip */
        .bar-tooltip {
          position: absolute;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          color: var(--text-primary);
          box-shadow: var(--shadow-lg), 0 10px 25px -5px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          transform: translateX(-50%);
          z-index: 10;
          pointer-events: none;
          min-width: 80px;
        }
        .bar-tooltip::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 8px;
          height: 8px;
          background: rgba(15, 23, 42, 0.95);
          border-right: 1px solid rgba(255, 255, 255, 0.15);
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        }
        .tooltip-date {
          font-size: 0.6875rem;
          color: var(--text-muted);
          font-weight: 600;
          margin-bottom: 0.125rem;
          text-transform: capitalize;
        }
        .tooltip-amount {
          font-size: 0.8125rem;
          font-weight: 800;
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};
