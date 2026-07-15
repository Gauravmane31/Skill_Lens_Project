/**
 * Resilient fetch wrapper with retry logic, timeout, and fallback support
 */

const DEFAULT_TIMEOUT_MS = 10000; // 10 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

/**
 * Sleep helper for retry backoff
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Create a timeout promise that rejects after a duration
 */
const createTimeoutPromise = (ms) => {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms),
  );
};

/**
 * Fetch with timeout support
 */
const fetchWithTimeout = (
  url,
  options = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));
};

/**
 * Resilient fetch: retry on network errors, respect timeouts, provide fallback
 */
export const resilientFetch = async (
  url,
  options = {},
  {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxRetries = MAX_RETRIES,
    onRetry = null,
    fallback = null,
  } = {},
) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options, timeoutMs);

      if (!response.ok) {
        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`Client error: ${response.status}`);
        }
        // Retry on server errors (5xx)
        if (response.status >= 500 && attempt < maxRetries) {
          lastError = new Error(`Server error: ${response.status}`);
          onRetry?.(`Attempt ${attempt + 1}/${maxRetries + 1} (server error)`);
          await sleep(RETRY_DELAY_MS * (attempt + 1)); // Exponential backoff
          continue;
        }
        throw new Error(`Request failed: ${response.status}`);
      }

      return response;
    } catch (error) {
      lastError = error;

      // Network errors, timeouts, and aborts are retryable
      const isRetryable =
        error.name === "AbortError" ||
        error.message.includes("timeout") ||
        error.message.includes("Failed to fetch") ||
        !navigator.onLine;

      if (isRetryable && attempt < maxRetries) {
        onRetry?.(
          `Attempt ${attempt + 1}/${maxRetries + 1} (${error.message})`,
        );
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }

      // Out of retries or non-retryable error
      break;
    }
  }

  // All retries failed
  if (fallback !== null) {
    console.warn(
      `Fetch failed for ${url}. Using fallback response.`,
      lastError,
    );
    return new Response(JSON.stringify(fallback), {
      status: 200,
      statusText: "Fallback (offline/unavailable)",
      headers: { "Content-Type": "application/json" },
    });
  }

  throw lastError || new Error("Request failed after all retries");
};

/**
 * Detect if app can reach the backend
 */
export const isBackendAvailable = async (backendUrl) => {
  try {
    const response = await fetchWithTimeout(`${backendUrl}/health`, {}, 3000);
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Local cache for API responses (simple localStorage-based)
 */
export const createResponseCache = () => {
  const KEY_PREFIX = "API_CACHE_";

  return {
    get: (key) => {
      const cached = localStorage.getItem(`${KEY_PREFIX}${key}`);
      if (!cached) return null;
      try {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        const maxAge = 5 * 60 * 1000; // 5 minute TTL
        return age < maxAge ? data : null;
      } catch {
        localStorage.removeItem(`${KEY_PREFIX}${key}`);
        return null;
      }
    },

    set: (key, value) => {
      try {
        localStorage.setItem(
          `${KEY_PREFIX}${key}`,
          JSON.stringify({
            data: value,
            timestamp: Date.now(),
          }),
        );
      } catch (e) {
        console.warn("Cache write failed:", e);
      }
    },

    clear: (pattern = "") => {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(KEY_PREFIX) && key.includes(pattern)) {
          localStorage.removeItem(key);
        }
      });
    },
  };
};

export const responseCache = createResponseCache();
