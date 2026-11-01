-- Schema cho D1 (SQLite). Chạy: npx wrangler d1 execute orbit-db --remote --file=db/schema.sql

CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  pass_hash   TEXT NOT NULL,
  salt        TEXT NOT NULL,
  iterations  INTEGER NOT NULL DEFAULT 120000,
  name        TEXT NOT NULL DEFAULT '',
  birthday    TEXT NOT NULL DEFAULT '',
  avatar      TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token       TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  expires_at  TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_exp  ON sessions(expires_at);

-- Toàn bộ dữ liệu ứng dụng của một người (người, sự kiện, nhật ký, cài đặt…)
-- lưu dạng JSON một dòng: khớp với cấu trúc `state` sẵn có của SPA.
CREATE TABLE IF NOT EXISTS user_state (
  user_id     TEXT PRIMARY KEY,
  payload     TEXT NOT NULL,
  version     INTEGER NOT NULL DEFAULT 1,
  updated_at  TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Nhật ký thao tác nhẹ để sau này đồng bộ theo mốc thời gian
CREATE TABLE IF NOT EXISTS sync_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT NOT NULL,
  kind        TEXT NOT NULL,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sync_user ON sync_log(user_id, created_at);

-- Token đặt lại mật khẩu: chỉ lưu SHA-256 của token, hạn 1 giờ, dùng một lần
CREATE TABLE IF NOT EXISTS reset_tokens (
  token_hash  TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  expires_at  TEXT NOT NULL,
  used_at     TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_reset_user ON reset_tokens(user_id);
