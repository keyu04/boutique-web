export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = new Headers(request.headers);
    // let the API see the real visitor for rate limiting
    headers.set("X-Forwarded-For", request.headers.get("CF-Connecting-IP") ?? "");
    return fetch(new Request(env.API_ORIGIN + url.pathname + url.search, {
      method: request.method,
      headers,
      body: request.body,
    }));
  },
};
