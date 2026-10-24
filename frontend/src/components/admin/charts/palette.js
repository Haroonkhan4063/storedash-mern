/**
 * @module charts/palette
 * Shared colour tokens so every chart and badge speaks one visual language.
 */
export const CHART_COLORS = ['#8b5cf6', '#22d3ee', '#34d399', '#fbbf24', '#fb7185', '#818cf8'];

export const STATUS_COLORS = {
  pending: '#fbbf24',
  paid: '#22d3ee',
  shipped: '#8b5cf6',
  delivered: '#34d399',
  cancelled: '#fb7185',
};

export const AXIS_PROPS = {
  stroke: '#64748b',
  tick: { fill: '#94a3b8', fontSize: 12 },
  tickLine: false,
  axisLine: false,
};

export const GRID_STROKE = 'rgba(255,255,255,0.06)';
