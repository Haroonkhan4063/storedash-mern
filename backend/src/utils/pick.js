/**
 * Returns a shallow copy of `source` restricted to the allowed keys. Used as an
 * allow-list to prevent mass-assignment of fields a client must not control.
 * @param {Record<string, unknown>} source
 * @param {string[]} allowed
 * @returns {Record<string, unknown>}
 */
export const pick = (source = {}, allowed = []) =>
  allowed.reduce((acc, key) => {
    if (source[key] !== undefined) acc[key] = source[key];
    return acc;
  }, {});
