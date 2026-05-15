// Facebook Conversions API — PageView events only.
// Receives event from the client, hashes user IP + UA, posts to Meta's Graph API.
// Token is in process.env.FB_CAPI_ACCESS_TOKEN (set in Vercel env vars).

import type { APIRoute } from 'astro';

export const prerender = false;

const PIXEL_ID = '189022943393553';
const META_API_VERSION = 'v22.0';

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const accessToken = import.meta.env.FB_CAPI_ACCESS_TOKEN;
  if (!accessToken) {
    return new Response(JSON.stringify({ ok: false, error: 'CAPI not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { event_id?: string; event_source_url?: string } = {};
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ua = request.headers.get('user-agent') ?? '';
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    clientAddress ||
    '';

  const payload = {
    data: [
      {
        event_name: 'PageView',
        event_time: Math.floor(Date.now() / 1000),
        event_id: body.event_id,
        event_source_url: body.event_source_url,
        action_source: 'website',
        user_data: {
          client_ip_address: ip,
          client_user_agent: ua,
        },
      },
    ],
  };

  const url = `https://graph.facebook.com/${META_API_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(accessToken)}`;

  try {
    const fbRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await fbRes.json();
    return new Response(JSON.stringify({ ok: fbRes.ok, fb: data }), {
      status: fbRes.ok ? 200 : 502,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
