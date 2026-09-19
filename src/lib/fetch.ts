/**
 * Safely fetches and parses JSON from an API endpoint.
 * Protects against 404/500 HTML error pages (e.g. <!DOCTYPE html>...) which cause
 * "Unexpected token '<', '<!DOCTYPE '... is not valid JSON" errors when calling res.json().
 */
export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  try {
    const res = await fetch(input, init);
    const contentType = res.headers.get('content-type') || '';
    
    if (!res.ok) {
      console.warn(`[safeFetchJson] HTTP ${res.status} from ${input}`);
      let errorMsg = `HTTP Error ${res.status}`;
      if (contentType.includes('application/json')) {
        try {
          const errData = await res.json();
          errorMsg = errData.error || errData.message || errorMsg;
        } catch (_) {}
      }
      return { ok: false, status: res.status, data: null, error: errorMsg };
    }

    if (!contentType.includes('application/json')) {
      console.warn(`[safeFetchJson] Non-JSON response received from ${input}`);
      return { ok: false, status: res.status, data: null, error: 'Response was not JSON' };
    }

    const data = await res.json();
    return { ok: true, status: res.status, data };
  } catch (err: any) {
    console.error(`[safeFetchJson] Network error for ${input}:`, err);
    return { ok: false, status: 0, data: null, error: err.message || 'Network error' };
  }
}
