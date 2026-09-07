function unauthorized(message = "Authentication required") {
  return new Response(message, {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="X2 LOTO Demo", charset="UTF-8"',
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow, noarchive"
    }
  });
}

export async function onRequest(context) {
  const user = context.env.DEMO_USER;
  const pass = context.env.DEMO_PASS;

  if (!user || !pass) {
    return new Response("Demo access is not configured", {
      status: 503,
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow, noarchive"
      }
    });
  }

  const auth = context.request.headers.get("Authorization") || "";
  if (!auth.startsWith("Basic ")) return unauthorized();

  let decoded;
  try {
    decoded = atob(auth.slice(6));
  } catch (_) {
    return unauthorized();
  }

  const separator = decoded.indexOf(":");
  if (separator < 0) return unauthorized();

  const suppliedUser = decoded.slice(0, separator);
  const suppliedPass = decoded.slice(separator + 1);
  if (suppliedUser !== user || suppliedPass !== pass) return unauthorized();

  const response = await context.next();
  const secured = new Response(response.body, response);
  secured.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  secured.headers.set("Cache-Control", "private, no-store");
  return secured;
}
