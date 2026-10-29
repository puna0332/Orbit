/**
 * Orbit — API cho tính năng "Gửi một kỷ niệm".
 *
 * App vẫn là SPA tĩnh; Worker này chỉ phục vụ vài endpoint JSON và trả mọi
 * request khác về asset tĩnh (kèm fallback SPA).
 *
 * Nguyên tắc bảo mật:
 *  - Token lời mời sinh ngẫu nhiên 24 byte, không đoán được.
 *  - Phía người nhận KHÔNG bao giờ thấy ownerId, personId hay secret.
 *  - Mỗi link chỉ gửi được một lần; hết hạn sau 30 ngày; chủ link có thể thu hồi.
 *  - Ảnh phải là data URL png/jpeg/webp, tối đa 3 ảnh, mỗi ảnh <= 400KB, và
 *    được kiểm tra magic bytes chứ không tin vào mime khai báo.
 */

const INVITE_TTL_DAYS = 30;
const MAX_CONTENT = 500;
const MAX_IMAGES = 3;
const MAX_IMAGE_BYTES = 400 * 1024;
const RATE_LIMIT_PER_HOUR = 20;

/* ------------------------------ tiện ích ------------------------------ */

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...extra,
    },
  });
}

function b64url(bytes) {
  let s = '';
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function newToken(bytes = 24) {
  return b64url(crypto.getRandomValues(new Uint8Array(bytes)));
}

/* So sánh chuỗi kiểu hằng thời gian để không lộ độ dài/khớp từng ký tự */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function nowIso() { return new Date().toISOString(); }

async function readInvite(env, token) {
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(token || '')) return null;
  const raw = await env.ORBIT_KV.get('inv:' + token, 'json');
  return raw || null;
}

async function inviteState(invite) {
  if (!invite) return 'missing';
  if (invite.revoked) return 'revoked';
  if (invite.usedAt) return 'used';
  if (Date.parse(invite.expiresAt) < Date.now()) return 'expired';
  return 'open';
}

async function ownerRecord(env, ownerId) {
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(ownerId || '')) return null;
  return await env.ORBIT_KV.get('own:' + ownerId, 'json');
}

/* Chỉ chủ Orbit biết secret; mọi thao tác đọc/ghi hộp thư đều phải khớp */
async function requireOwner(env, ownerId, secret) {
  const own = await ownerRecord(env, ownerId);
  if (!own) return null;
  if (!safeEqual(own.secret, String(secret || ''))) return null;
  return own;
}

async function rateLimited(env, req, bucket) {
  const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown';
  const key = `rl:${bucket}:${ip}`;
  const cur = (await env.ORBIT_KV.get(key, 'json')) || { n: 0 };
  if (cur.n >= RATE_LIMIT_PER_HOUR) return true;
  // KV không có phép tăng nguyên tử; sai số nhỏ chấp nhận được cho mục đích chống spam
  await env.ORBIT_KV.put(key, JSON.stringify({ n: cur.n + 1 }), { expirationTtl: 3600 });
  return false;
}

/* Kiểm tra ảnh: data URL + magic bytes + kích thước thật sau khi giải mã */
function inspectImage(input) {
  if (typeof input !== 'string') return { ok: false };
  const m = /^data:(image\/(png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(input);
  if (!m) return { ok: false };
  const mime = m[1];
  let bytes;
  try {
    const bin = atob(m[3]);
    if (bin.length > MAX_IMAGE_BYTES) return { ok: false };
    bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  } catch { return { ok: false }; }
  const sig = (offset, values) => values.every((v, i) => bytes[offset + i] === v);
  const isPng = sig(0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const isJpeg = sig(0, [0xff, 0xd8, 0xff]);
  const isWebp = sig(0, [0x52, 0x49, 0x46, 0x46]) && sig(8, [0x57, 0x45, 0x42, 0x50]);
  const realMime = isPng ? 'image/png' : isJpeg ? 'image/jpeg' : isWebp ? 'image/webp' : null;
  if (!realMime || realMime !== mime) return { ok: false };
  return { ok: true, mime: realMime, data: input };
}

/* ------------------------------ API ------------------------------ */

async function apiCreateInvite(req, env) {
  const body = await req.json().catch(() => null);
  if (!body) return json({ error: 'bad_json' }, 400);

  const ownerId = String(body.ownerId || '');
  const secret = String(body.ownerSecret || '');
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(ownerId) || secret.length < 24) return json({ error: 'bad_owner' }, 400);

  let own = await ownerRecord(env, ownerId);
  if (!own) {
    own = { secret, name: String(body.ownerName || 'Bạn').slice(0, 40), createdAt: nowIso() };
    await env.ORBIT_KV.put('own:' + ownerId, JSON.stringify(own));
  } else if (!safeEqual(own.secret, secret)) {
    return json({ error: 'bad_owner' }, 403);
  }

  const personId = String(body.personId || '').slice(0, 64);
  const personName = String(body.personName || '').trim().slice(0, 60);
  if (!personId || !personName) return json({ error: 'bad_person' }, 400);

  if (await rateLimited(env, req, 'invite')) return json({ error: 'rate_limited' }, 429);

  const token = newToken(24);
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 864e5).toISOString();
  const invite = {
    token, ownerId, personId, personName,
    ownerName: own.name,
    createdAt, expiresAt, usedAt: null, revoked: false,
  };
  await env.ORBIT_KV.put('inv:' + token, JSON.stringify(invite), { expirationTtl: INVITE_TTL_DAYS * 86400 });
  return json({ token, expiresAt, path: '/memory/invite/' + token });
}

async function apiGetInvite(env, token) {
  const invite = await readInvite(env, token);
  const state = await inviteState(invite);
  if (!invite) return json({ status: state }, 404);
  /* Không trả ownerId/personId/token — người mở link không cần và không nên biết */
  return json({
    status: state,
    personName: invite.personName,
    ownerName: invite.ownerName,
    expiresAt: invite.expiresAt,
    maxContent: MAX_CONTENT,
    maxImages: MAX_IMAGES,
  });
}

async function apiSubmitInvite(req, env, token) {
  const invite = await readInvite(env, token);
  const state = await inviteState(invite);
  if (state !== 'open') return json({ error: state }, 410);

  if (await rateLimited(env, req, 'submit')) return json({ error: 'rate_limited' }, 429);

  const body = await req.json().catch(() => null);
  if (!body) return json({ error: 'bad_json' }, 400);

  const content = String(body.content || '').trim();
  if (!content) return json({ error: 'empty' }, 400);
  if (content.length > MAX_CONTENT) return json({ error: 'too_long' }, 400);

  const rawImages = Array.isArray(body.images) ? body.images.slice(0, MAX_IMAGES + 1) : [];
  if (rawImages.length > MAX_IMAGES) return json({ error: 'too_many_images' }, 400);
  const images = [];
  for (const img of rawImages) {
    const info = inspectImage(img);
    if (!info.ok) return json({ error: 'bad_image' }, 400);
    images.push(info.data);
  }

  const memoryId = newToken(12);
  const memory = {
    id: memoryId,
    personId: invite.personId,
    invitationId: token,
    type: 'guest_message',
    content,
    images,
    createdAt: nowIso(),
    source: 'invite_link',
    hidden: false,
  };
  await env.ORBIT_KV.put('mem:' + invite.ownerId + ':' + memoryId, JSON.stringify(memory));

  /* Đánh dấu đã dùng NGAY sau khi ghi xong, để link không gửi được lần hai */
  invite.usedAt = nowIso();
  await env.ORBIT_KV.put('inv:' + token, JSON.stringify(invite), { expirationTtl: INVITE_TTL_DAYS * 86400 });

  return json({ ok: true, memoryId });
}

async function apiRevoke(req, env, token) {
  const body = await req.json().catch(() => null) || {};
  const own = await requireOwner(env, String(body.ownerId || ''), String(body.ownerSecret || ''));
  if (!own) return json({ error: 'bad_owner' }, 403);
  const invite = await readInvite(env, token);
  if (!invite) return json({ error: 'missing' }, 404);
  if (invite.ownerId !== body.ownerId) return json({ error: 'forbidden' }, 403);
  invite.revoked = true;
  await env.ORBIT_KV.put('inv:' + token, JSON.stringify(invite), { expirationTtl: INVITE_TTL_DAYS * 86400 });
  return json({ ok: true });
}

async function apiInbox(req, env, url) {
  const ownerId = url.searchParams.get('owner') || '';
  const secret = url.searchParams.get('secret') || '';
  const own = await requireOwner(env, ownerId, secret);
  if (!own) return json({ error: 'bad_owner' }, 403);

  const list = await env.ORBIT_KV.list({ prefix: 'mem:' + ownerId + ':', limit: 200 });
  const memories = [];
  for (const k of list.keys) {
    const m = await env.ORBIT_KV.get(k.name, 'json');
    if (m) memories.push({
      id: m.id, personId: m.personId, content: m.content, images: m.images,
      createdAt: m.createdAt, type: m.type, source: m.source, hidden: !!m.hidden,
    });
  }
  memories.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return json({ memories });
}

async function apiMemoryAction(req, env, url, memoryId, action) {
  const body = await req.json().catch(() => null) || {};
  const ownerId = String(body.ownerId || '');
  const own = await requireOwner(env, ownerId, String(body.ownerSecret || ''));
  if (!own) return json({ error: 'bad_owner' }, 403);

  const key = 'mem:' + ownerId + ':' + memoryId;
  const m = await env.ORBIT_KV.get(key, 'json');
  if (!m) return json({ error: 'missing' }, 404);

  if (action === 'hide') {
    m.hidden = body.hidden !== false;
    await env.ORBIT_KV.put(key, JSON.stringify(m));
    return json({ ok: true, hidden: m.hidden });
  }
  if (action === 'delete') {
    await env.ORBIT_KV.delete(key);
    return json({ ok: true });
  }
  return json({ error: 'bad_action' }, 400);
}

/* ------------------------------ router ------------------------------ */

async function handleApi(req, env, url) {
  const p = url.pathname;
  if (req.method === 'POST' && p === '/api/invite') return apiCreateInvite(req, env);

  if (p === '/api/inbox' && req.method === 'GET') return apiInbox(req, env, url);

  let m = /^\/api\/invite\/([A-Za-z0-9_-]+)(\/revoke)?$/.exec(p);
  if (m) {
    const token = m[1];
    if (m[2] && req.method === 'POST') return apiRevoke(req, env, token);
    if (!m[2] && req.method === 'GET') return apiGetInvite(env, token);
    if (!m[2] && req.method === 'POST') return apiSubmitInvite(req, env, token);
  }

  m = /^\/api\/memory\/([A-Za-z0-9_-]+)\/(hide|delete)$/.exec(p);
  if (m && req.method === 'POST') return apiMemoryAction(req, env, url, m[1], m[2]);

  return json({ error: 'not_found' }, 404);
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleApi(req, env, url);
      } catch (err) {
        return json({ error: 'server_error' }, 500);
      }
    }
    return env.ASSETS.fetch(req);
  },
};
