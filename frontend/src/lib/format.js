/**
 * @module lib/format
 * Locale-aware presentation helpers.
 */

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

/** @param {number} value @returns {string} */
export const formatCurrency = (value) => currency.format(value ?? 0);

/** @param {string|number|Date} value @returns {string} */
export const formatDate = (value) => date.format(new Date(value));

const compactCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });
const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

/** @param {number} value @returns {string} e.g. `$12.4K` */
export const formatCompactCurrency = (value) => compactCurrency.format(value ?? 0);

/** @param {string} isoDay `YYYY-MM-DD` @returns {string} e.g. `Oct 18` */
export const formatShortDate = (isoDay) => shortDate.format(new Date(`${isoDay}T00:00:00Z`));
