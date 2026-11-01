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


/* ======================================================================
   Tài khoản + đồng bộ dữ liệu người dùng (Cloudflare D1)
   ----------------------------------------------------------------------
   - Mật khẩu băm bằng PBKDF2-SHA256 (120k vòng) + salt 16 byte ngẫu nhiên.
   - Phiên đăng nhập là token 32 byte ngẫu nhiên, hạn 60 ngày, lưu ở bảng
     sessions; client gửi kèm header `Authorization: Bearer <token>`.
   - Dữ liệu ứng dụng (người, sự kiện, nhật ký, cài đặt…) là một khối JSON
     trong user_state, khớp với `state` của SPA.
   ====================================================================== */

const SESSION_DAYS = 60;
/* Workers giới hạn PBKDF2 tối đa 100.000 vòng — vượt là lỗi 500 ở production. */
const PBKDF2_ITER = 100000;
const MAX_STATE_BYTES = 900 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function randHex(n) {
  return Array.from(crypto.getRandomValues(new Uint8Array(n)))
    .map((b) => b.toString(16).padStart(2, '0')).join('');
}
function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}
async function pbkdf2(password, saltHex, iterations) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: hexToBytes(saltHex), iterations: iterations, hash: 'SHA-256' }, key, 256);
  return Array.from(new Uint8Array(bits)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
function plusDays(days) {
  return new Date(Date.now() + days * 86400000).toISOString();
}

async function db(env) {
  if (!env.ORBIT_DB) throw new Error('no_db');
  return env.ORBIT_DB;
}

async function createSession(env, userId) {
  const token = randHex(32);
  await env.ORBIT_DB.prepare(
    'INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)'
  ).bind(token, userId, nowIso(), plusDays(SESSION_DAYS)).run();
  return token;
}

async function authUser(req, env) {
  const h = req.headers.get('authorization') || '';
  const m = /^Bearer ([A-Za-z0-9]{20,120})$/.exec(h);
  if (!m) return null;
  const row = await env.ORBIT_DB.prepare(
    'SELECT s.token, s.expires_at, u.id, u.email, u.name, u.birthday, u.avatar, u.created_at ' +
    'FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?'
  ).bind(m[1]).first();
  if (!row) return null;
  if (Date.parse(row.expires_at) < Date.now()) {
    await env.ORBIT_DB.prepare('DELETE FROM sessions WHERE token = ?').bind(m[1]).run();
    return null;
  }
  return row;
}

function publicUser(u) {
  return { id: u.id, email: u.email, name: u.name || '', birthday: u.birthday || '', avatar: u.avatar || '' };
}

async function apiRegister(req, env) {
  const body = await req.json().catch(() => null);
  if (!body) return json({ error: 'bad_json' }, 400);
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!EMAIL_RE.test(email)) return json({ error: 'bad_email' }, 400);
  if (password.length < 8) return json({ error: 'weak_password' }, 400);
  if (password.length > 200) return json({ error: 'bad_password' }, 400);

  const exists = await env.ORBIT_DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (exists) return json({ error: 'email_taken' }, 409);

  const salt = randHex(16);
  const hash = await pbkdf2(password, salt, PBKDF2_ITER);
  const id = 'u_' + randHex(12);
  const at = nowIso();
  try {
    await env.ORBIT_DB.prepare(
      'INSERT INTO users (id, email, pass_hash, salt, iterations, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, email, hash, salt, PBKDF2_ITER, String(body.name || '').slice(0, 60), at, at).run();
  } catch (e) {
    return json({ error: 'email_taken' }, 409);
  }
  const token = await createSession(env, id);
  return json({ ok: true, token: token, user: { id: id, email: email, name: '', birthday: '', avatar: '' } });
}

async function apiLogin(req, env) {
  const body = await req.json().catch(() => null);
  if (!body) return json({ error: 'bad_json' }, 400);
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!email || !password) return json({ error: 'bad_credentials' }, 400);

  const u = await env.ORBIT_DB.prepare(
    'SELECT id, email, pass_hash, salt, iterations, name, birthday, avatar FROM users WHERE email = ?'
  ).bind(email).first();
  if (!u) return json({ error: 'bad_credentials' }, 401);

  const hash = await pbkdf2(password, u.salt, u.iterations);
  if (!safeEqual(hash, u.pass_hash)) return json({ error: 'bad_credentials' }, 401);

  const token = await createSession(env, u.id);
  return json({ ok: true, token: token, user: publicUser(u) });
}

async function apiLogout(req, env) {
  const h = req.headers.get('authorization') || '';
  const m = /^Bearer ([A-Za-z0-9]{20,120})$/.exec(h);
  if (m) await env.ORBIT_DB.prepare('DELETE FROM sessions WHERE token = ?').bind(m[1]).run();
  return json({ ok: true });
}

async function apiMe(req, env) {
  const u = await authUser(req, env);
  if (!u) return json({ error: 'unauthorized' }, 401);
  return json({ ok: true, user: publicUser(u) });
}

async function apiUpdateProfile(req, env) {
  const u = await authUser(req, env);
  if (!u) return json({ error: 'unauthorized' }, 401);
  const body = await req.json().catch(() => null);
  if (!body) return json({ error: 'bad_json' }, 400);
  const name = String(body.name || '').trim().slice(0, 60);
  const birthday = String(body.birthday || '').slice(0, 10);
  const avatar = String(body.avatar || '').slice(0, 200);
  await env.ORBIT_DB.prepare(
    'UPDATE users SET name = ?, birthday = ?, avatar = ?, updated_at = ? WHERE id = ?'
  ).bind(name, birthday, avatar, nowIso(), u.id).run();
  return json({ ok: true, user: { id: u.id, email: u.email, name: name, birthday: birthday, avatar: avatar } });
}

async function apiGetState(req, env) {
  const u = await authUser(req, env);
  if (!u) return json({ error: 'unauthorized' }, 401);
  const row = await env.ORBIT_DB.prepare('SELECT payload, version, updated_at FROM user_state WHERE user_id = ?')
    .bind(u.id).first();
  if (!row) return json({ ok: true, state: null, version: 0, updatedAt: null });
  let payload = null;
  try { payload = JSON.parse(row.payload); } catch { payload = null; }
  return json({ ok: true, state: payload, version: row.version, updatedAt: row.updated_at });
}

async function apiPutState(req, env) {
  const u = await authUser(req, env);
  if (!u) return json({ error: 'unauthorized' }, 401);
  const body = await req.json().catch(() => null);
  if (!body || typeof body.state !== 'object' || body.state === null) return json({ error: 'bad_json' }, 400);
  const payload = JSON.stringify(body.state);
  if (payload.length > MAX_STATE_BYTES) return json({ error: 'too_large' }, 413);

  const at = nowIso();
  await env.ORBIT_DB.prepare(
    'INSERT INTO user_state (user_id, payload, version, updated_at) VALUES (?, ?, 1, ?) ' +
    'ON CONFLICT(user_id) DO UPDATE SET payload = excluded.payload, version = user_state.version + 1, updated_at = excluded.updated_at'
  ).bind(u.id, payload, at).run();
  await env.ORBIT_DB.prepare('INSERT INTO sync_log (user_id, kind, created_at) VALUES (?, ?, ?)')
    .bind(u.id, 'state_put', at).run();

  const v = await env.ORBIT_DB.prepare('SELECT version, updated_at FROM user_state WHERE user_id = ?').bind(u.id).first();
  return json({ ok: true, version: v ? v.version : 1, updatedAt: v ? v.updated_at : at });
}

async function apiDeleteAccount(req, env) {
  const u = await authUser(req, env);
  if (!u) return json({ error: 'unauthorized' }, 401);
  await env.ORBIT_DB.batch([
    env.ORBIT_DB.prepare('DELETE FROM user_state WHERE user_id = ?').bind(u.id),
    env.ORBIT_DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(u.id),
    env.ORBIT_DB.prepare('DELETE FROM users WHERE id = ?').bind(u.id),
  ]);
  return json({ ok: true });
}


/* ---------------------- Quên mật khẩu + đăng nhập Google ---------------------- */

const RESET_TTL_MIN = 60;
const APP_NAME = 'Orbit';

function sha256Hex(str) {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
    .then((buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join(''));
}

/* Gửi mail: ưu tiên Resend (secret RESEND_API_KEY), sau đó binding SEND_EMAIL của
   Cloudflare Email Routing. Chưa cấu hình thì trả về false để API nói thật với
   người dùng thay vì im lặng coi như đã gửi. */
/* Địa chỉ gửi: ưu tiên MAIL_FROM; nếu chưa đặt thì hỏi Resend xem có domain nào
   đã verify chưa. Chưa có domain thì trả '' (chỉ còn hộp cát onboarding@resend.dev,
   gửi được đúng chủ tài khoản — không tính là "đã cấu hình mail"). */
let mailCache = { at: 0, from: '' };
async function resendFrom(env) {
  if (env.MAIL_FROM) return env.MAIL_FROM;
  if (!env.RESEND_API_KEY) return '';
  if (Date.now() - mailCache.at < 600000) return mailCache.from;
  try {
    const r = await fetch('https://api.resend.com/domains', { headers: { authorization: 'Bearer ' + env.RESEND_API_KEY } });
    const j = await r.json();
    const d = (j.data || []).find((x) => x.status === 'verified');
    mailCache = { at: Date.now(), from: d ? 'Orbit <no-reply@' + d.name + '>' : '' };
  } catch { mailCache = { at: Date.now(), from: '' }; }
  return mailCache.from;
}

async function sendMail(env, to, subject, html, text) {
  if (env.RESEND_API_KEY) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: 'Bearer ' + env.RESEND_API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: (await resendFrom(env)) || 'Orbit <onboarding@resend.dev>',
        to: [to], subject: subject, html: html, text: text,
      }),
    });
    if (!r.ok) {
      /* Ghi lý do vào log Worker (không trả ra client) để dễ chẩn đoán:
         thường gặp 403 vì gửi từ onboarding@resend.dev tới địa chỉ khác chủ tài khoản. */
      let detail = '';
      try { detail = (await r.text()).slice(0, 400); } catch {}
      console.warn('resend_failed', r.status, detail);
    }
    return r.ok;
  }
  if (env.SEND_EMAIL) {
    try {
      await env.SEND_EMAIL.send({
        to: to, from: { email: env.MAIL_FROM_ADDRESS || 'no-reply@orbit.app', name: APP_NAME },
        subject: subject, html: html, text: text,
      });
      return true;
    } catch { return false; }
  }
  return false;
}

function resetEmailHtml(link) {
  return '<div style="font-family:Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#2C2A33">' +
    '<h2 style="margin:0 0 12px;color:#1D3A63">Đặt lại mật khẩu Orbit</h2>' +
    '<p style="margin:0 0 16px;font-size:14px;line-height:1.6">Bạn vừa yêu cầu đặt lại mật khẩu. Bấm nút bên dưới để tạo mật khẩu mới — liên kết chỉ dùng được một lần và hết hạn sau ' + RESET_TTL_MIN + ' phút.</p>' +
    '<p style="margin:0 0 20px"><a href="' + link + '" style="display:inline-block;background:#1D3A63;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:700">Đặt lại mật khẩu</a></p>' +
    '<p style="margin:0;font-size:12px;color:#7A6A5D">Nếu không phải bạn yêu cầu, bỏ qua email này — mật khẩu hiện tại vẫn giữ nguyên.</p></div>';
}

async function apiForgot(req, env, url) {
  const body = await req.json().catch(() => null);
  if (!body) return json({ error: 'bad_json' }, 400);
  const email = String(body.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return json({ error: 'bad_email' }, 400);
  if (await rateLimited(env, req, 'forgot')) return json({ error: 'rate_limited' }, 429);

  const u = await env.ORBIT_DB.prepare('SELECT id, email FROM users WHERE email = ?').bind(email).first();
  /* Luôn trả 200 cho mọi email để phản hồi không phụ thuộc việc email có tồn tại hay
     không; trường `known` chỉ dùng để giao diện báo đúng cho người dùng. */
  if (!u) return json({ ok: true, delivered: false, known: false });

  const token = randHex(32);
  const hash = await sha256Hex(token);
  const exp = new Date(Date.now() + RESET_TTL_MIN * 60000).toISOString();
  await env.ORBIT_DB.prepare(
    'INSERT INTO reset_tokens (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)'
  ).bind(hash, u.id, nowIso(), exp).run();

  const origin = url.origin;
  const link = origin + '/#/reset?token=' + token;
  const delivered = await sendMail(env, email, 'Đặt lại mật khẩu ' + APP_NAME,
    resetEmailHtml(link), 'Mở liên kết để đặt lại mật khẩu: ' + link);
  return json({ ok: true, delivered: delivered, known: true });
}

async function apiReset(req, env) {
  const body = await req.json().catch(() => null);
  if (!body) return json({ error: 'bad_json' }, 400);
  const token = String(body.token || '');
  const password = String(body.password || '');
  if (!/^[a-f0-9]{32,128}$/.test(token)) return json({ error: 'bad_token' }, 400);
  if (password.length < 8) return json({ error: 'weak_password' }, 400);

  const hash = await sha256Hex(token);
  const row = await env.ORBIT_DB.prepare(
    'SELECT token_hash, user_id, expires_at, used_at FROM reset_tokens WHERE token_hash = ?'
  ).bind(hash).first();
  if (!row || row.used_at || Date.parse(row.expires_at) < Date.now()) return json({ error: 'bad_token' }, 400);

  const salt = randHex(16);
  const passHash = await pbkdf2(password, salt, PBKDF2_ITER);
  await env.ORBIT_DB.batch([
    env.ORBIT_DB.prepare('UPDATE users SET pass_hash = ?, salt = ?, iterations = ?, updated_at = ? WHERE id = ?')
      .bind(passHash, salt, PBKDF2_ITER, nowIso(), row.user_id),
    env.ORBIT_DB.prepare('UPDATE reset_tokens SET used_at = ? WHERE token_hash = ?').bind(nowIso(), hash),
    env.ORBIT_DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(row.user_id),
  ]);
  return json({ ok: true });
}

/* --- Google: xác thực id_token bằng JWKS của Google (không tin dữ liệu client) --- */
let googleCerts = { at: 0, keys: {} };
async function googleKeys() {
  if (Date.now() - googleCerts.at < 3600000 && Object.keys(googleCerts.keys).length) return googleCerts.keys;
  const r = await fetch('https://www.googleapis.com/oauth2/v3/certs');
  const j = await r.json();
  const keys = {};
  for (const k of j.keys || []) keys[k.kid] = k;
  googleCerts = { at: Date.now(), keys: keys };
  return keys;
}

function b64urlToBytes(s) {
  const pad = s + '==='.slice((s.length + 3) % 4);
  const b = atob(pad.replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out;
}

async function verifyGoogleIdToken(idToken, clientId) {
  const parts = String(idToken || '').split('.');
  if (parts.length !== 3) return null;
  let header, payload;
  try {
    header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
  } catch { return null; }
  if (!header || !payload) return null;
  if (payload.iss !== 'accounts.google.com' && payload.iss !== 'https://accounts.google.com') return null;
  if (clientId && payload.aud !== clientId) return null;
  if (payload.exp * 1000 < Date.now()) return null;

  try {
    const keys = await googleKeys();
    const jwk = keys[header.kid];
    if (!jwk) return null;
    const key = await crypto.subtle.importKey('jwk',
      { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key,
      b64urlToBytes(parts[2]), new TextEncoder().encode(parts[0] + '.' + parts[1]));
    return ok ? payload : null;
  } catch { return null; }
}

async function apiGoogle(req, env) {
  const body = await req.json().catch(() => null);
  if (!body) return json({ error: 'bad_json' }, 400);
  const payload = await verifyGoogleIdToken(body.credential, env.GOOGLE_CLIENT_ID || '');
  if (!payload || !payload.email) return json({ error: 'bad_credential' }, 401);
  if (payload.email_verified === false) return json({ error: 'email_unverified' }, 403);

  const email = String(payload.email).toLowerCase();
  let u = await env.ORBIT_DB.prepare('SELECT id, email, name, birthday, avatar FROM users WHERE email = ?').bind(email).first();
  if (!u) {
    const id = 'u_' + randHex(12);
    const at = nowIso();
    await env.ORBIT_DB.prepare(
      'INSERT INTO users (id, email, pass_hash, salt, iterations, name, avatar, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, email, '', '', 0, String(payload.name || '').slice(0, 60), String(payload.picture || '').slice(0, 200), at, at).run();
    u = { id: id, email: email, name: payload.name || '', birthday: '', avatar: '' };
  }
  const token = await createSession(env, u.id);
  return json({ ok: true, token: token, user: publicUser(u) });
}

async function apiConfig(env) {
  const from = await resendFrom(env);
  return json({
    ok: true,
    googleClientId: env.GOOGLE_CLIENT_ID || '',
    /* Chỉ coi là "gửi được mail" khi có domain đã verify (hoặc binding SEND_EMAIL) */
    mailConfigured: !!(from || env.SEND_EMAIL),
  });
}

/* ------------------------------ router ------------------------------ */

async function handleApi(req, env, url) {
  const p = url.pathname;

  /* --- tài khoản --- */
  if (p === '/api/auth/register' && req.method === 'POST') return apiRegister(req, env);
  if (p === '/api/auth/forgot' && req.method === 'POST') return apiForgot(req, env, url);
  if (p === '/api/auth/reset' && req.method === 'POST') return apiReset(req, env);
  if (p === '/api/auth/google' && req.method === 'POST') return apiGoogle(req, env);
  if (p === '/api/config' && req.method === 'GET') return apiConfig(env);
  if (p === '/api/auth/login' && req.method === 'POST') return apiLogin(req, env);
  if (p === '/api/auth/logout' && req.method === 'POST') return apiLogout(req, env);
  if (p === '/api/auth/me' && req.method === 'GET') return apiMe(req, env);
  if (p === '/api/account' && req.method === 'DELETE') return apiDeleteAccount(req, env);

  /* --- hồ sơ + dữ liệu --- */
  if (p === '/api/profile' && (req.method === 'PUT' || req.method === 'POST')) return apiUpdateProfile(req, env);
  if (p === '/api/state' && req.method === 'GET') return apiGetState(req, env);
  if (p === '/api/state' && req.method === 'PUT') return apiPutState(req, env);

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
