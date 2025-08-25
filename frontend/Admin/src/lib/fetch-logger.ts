// Global fetch interceptor for logging every request & response
// Import this once at app bootstrap (before other network calls)

declare global {
  interface Window { __FETCH_LOGGER_INSTALLED__?: boolean; }
}

const originalFetch = window.fetch;

if (!window.__FETCH_LOGGER_INSTALLED__) {
  window.__FETCH_LOGGER_INSTALLED__ = true;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let method = init?.method || 'GET';
    let url: string;
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else { // Request object
      url = input.url;
      method = input.method || method;
    }
    method = method.toUpperCase();
    const started = performance.now();

    let bodyPreview: string | undefined;
    try {
      if (init?.body && typeof init.body === 'string') {
        bodyPreview = init.body.length > 800 ? init.body.slice(0, 800) + '…(truncated)' : init.body;
      }
    } catch { /* ignore */ }

    // Mask auth header
    const headers: Record<string,string> = {};
    if (init?.headers) {
      if (Array.isArray(init.headers)) init.headers.forEach(([k,v]) => headers[k] = v);
      else if (init.headers instanceof Headers) init.headers.forEach((v,k) => headers[k]=v);
      else Object.entries(init.headers as Record<string,unknown>).forEach(([k,v]) => { if (v!=null) headers[k]=String(v); });
    }
    const authKey = Object.keys(headers).find(k => k.toLowerCase()==='authorization');
    if (authKey) headers[authKey] = 'Bearer ***';

    // Log request
    console.debug('%c[HTTP REQUEST]','color:#546e7a', { method, url, headers, body: bodyPreview });

    try {
      const res = await originalFetch(input, init);
      const duration = Math.round(performance.now() - started);
      const contentType = res.headers.get('content-type') || '';
      let preview: unknown = '[non-text body]';
      try {
        if (contentType.includes('application/json')) {
          const clone = res.clone();
            const json = await clone.json();
            const jsonStr = JSON.stringify(json);
            preview = jsonStr.length > 1500 ? JSON.parse(jsonStr.slice(0, 1500)) : json;
        } else if (contentType.startsWith('text/')) {
          const clone = res.clone();
          const text = await clone.text();
          preview = text.length > 1500 ? text.slice(0,1500)+'…(truncated)' : text;
        }
      } catch { /* swallow parse issues */ }
      const logStyle = res.ok ? 'color:#2e7d32' : 'color:#c62828;font-weight:bold';
      console.debug('%c[HTTP RESPONSE]', logStyle, { method, url, status: res.status, ok: res.ok, durationMs: duration, contentType }, preview);
      return res;
    } catch (err) {
      console.error('[HTTP ERROR]', { method, url, error: err });
      throw err;
    }
  };
}

export {}; // side-effect only
