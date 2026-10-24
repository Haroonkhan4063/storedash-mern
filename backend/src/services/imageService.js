/**
 * @module services/imageService
 * Product photography lookup backed by the Pexels search API. Used by the seed
 * script so each catalogue entry receives a photograph matching its search
 * query without any images being committed to the repository.
 */
import { env } from '../config/env.js';

const PEXELS_SEARCH_URL = 'https://api.pexels.com/v1/search';
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_ATTEMPTS = 4;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Queries Pexels, retrying on rate limiting (HTTP 429) and transient server errors
 * with exponential backoff.
 * @param {string} query Search phrase.
 * @param {number} [perPage=15] Candidates to request (max 80).
 * @returns {Promise<Array<{id: number, alt: string, src: {large: string}}>>}
 * @throws {Error} When the key is rejected or all attempts fail.
 */
export async function searchPhotos(query, perPage = 15) {
  const url = `${PEXELS_SEARCH_URL}?${new URLSearchParams({ query, per_page: String(perPage), orientation: 'landscape' })}`;
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { Authorization: env.pexelsApiKey },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (response.status === 401 || response.status === 403) {
        throw Object.assign(new Error('Pexels rejected the API key (check PEXELS_API_KEY)'), { fatal: true });
      }
      if (response.status === 429 || response.status >= 500) {
        const retryAfter = Number(response.headers.get('retry-after'));
        await sleep((retryAfter > 0 ? retryAfter : 2 ** attempt) * 1000);
        lastError = new Error(`Pexels responded with ${response.status}`);
        continue;
      }
      if (!response.ok) throw new Error(`Pexels responded with ${response.status}`);

      const { photos = [] } = await response.json();
      return photos;
    } catch (error) {
      if (error.fatal) throw error;
      lastError = error;
      await sleep(2 ** attempt * 250);
    }
  }
  throw lastError ?? new Error('Pexels request failed');
}

/**
 * Finds the best photo for a query that has not already been assigned to another
 * product, guaranteeing every product receives a distinct picture.
 * @param {string} query
 * @param {Set<number>} claimedIds Photo ids already used; mutated when a photo is claimed.
 * Widens the candidate pool once before giving up.
 * @returns {Promise<{url: string, alt: string, id: number}|null>} `null` when no unused result exists.
 */
export async function findUniquePhoto(query, claimedIds) {
  for (const candidates of [15, 40]) {
    const photos = await searchPhotos(query, candidates);
    const choice = photos.find((photo) => !claimedIds.has(photo.id));
    if (choice) {
      claimedIds.add(choice.id);
      return { id: choice.id, alt: choice.alt || query, url: choice.src.large };
    }
    if (photos.length < candidates) break;
  }
  return null;
}
