import { getDashboardAnalytics, getCustomerSummaries, resolveRange } from '../services/analyticsService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** GET /api/analytics?days=7|30|90 (admin). Aggregated KPIs, time series and breakdowns. */
export const dashboardAnalytics = asyncHandler(async (req, res) => {
  res.json(await getDashboardAnalytics(resolveRange(req.query.days)));
});

/** GET /api/analytics/customers (admin). Customer directory with lifetime value. */
export const customerDirectory = asyncHandler(async (_req, res) => {
  res.json(await getCustomerSummaries());
});
