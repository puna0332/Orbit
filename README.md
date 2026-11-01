
## Tài khoản & dữ liệu (Cloudflare D1)

App chạy trên Cloudflare Worker: static SPA + API `/api/*`, dữ liệu trong **D1** (`orbit-db`).

| Bảng | Nội dung |
|---|---|
| `users` | email, PBKDF2-SHA256 (100k vòng) + salt, tên, ngày sinh, avatar |
| `sessions` | token 32 byte (hex), hạn 60 ngày |
| `user_state` | toàn bộ dữ liệu app dạng JSON, 1 dòng / người |
| `reset_tokens` | token đặt lại mật khẩu (chỉ lưu SHA-256), hạn 60 phút, dùng 1 lần |
| `sync_log` | mốc ghi gần nhất |

### Biến môi trường / secret

```bash
# Gửi mail đặt lại mật khẩu (Resend — free 3.000 mail/tháng)
npx wrangler secret put RESEND_API_KEY
# (tuỳ chọn) người gửi đã xác thực trong Resend
npx wrangler secret put MAIL_FROM          # vd: Orbit <no-reply@yourdomain.com>
# Đăng nhập Google (OAuth Client ID, loại Web application)
npx wrangler secret put GOOGLE_CLIENT_ID
```

Chưa cấu hình thì app vẫn chạy: nút Google báo "chưa cấu hình", còn quên mật khẩu báo
"máy chủ chưa cấu hình gửi mail" thay vì giả vờ thành công.

### Lệnh thường dùng

```bash
npx wrangler deploy                                   # deploy worker + SPA
npx wrangler d1 execute orbit-db --remote --file=db/schema.sql   # áp schema
npx wrangler d1 execute orbit-db --remote --command "SELECT email,name FROM users"
```
