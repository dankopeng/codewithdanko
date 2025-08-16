import { Hono } from "hono";
import { cors } from "hono/cors";
import { SignJWT, jwtVerify } from "jose";

export interface Env {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  JWT_SECRET: string;
}

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for all routes
app.use("*", cors({
  origin: ["*"],
  credentials: true,
  allowHeaders: ["Authorization", "Content-Type"]
}));

app.get("/api/health", (c) => c.json({ ok: true, ts: Date.now() }));

// Helpers
async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const data = new Uint8Array(salt.length + password.length);
  data.set(salt);
  data.set(enc.encode(password), salt.length);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, "0")).join("");
  const hashHex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${saltHex}$${hashHex}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split("$");
  if (!saltHex || !hashHex) return false;
  const enc = new TextEncoder();
  const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map((h) => parseInt(h, 16)));
  const data = new Uint8Array(salt.length + password.length);
  data.set(salt);
  data.set(enc.encode(password), salt.length);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const computed = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return computed === hashHex;
}

// 提取令牌的辅助函数
function extractToken(request: Request | { header: (name: string) => string | undefined }): string | null {
  let authHeader: string | null | undefined;
  
  if ('header' in request && typeof request.header === 'function') {
    // Hono 请求对象
    authHeader = request.header("Authorization");
  } else if (request instanceof Request) {
    // 标准 Request 对象
    authHeader = request.headers.get("Authorization");
  }
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7); // 移除 "Bearer " 前缀
}

// 验证令牌并获取用户信息
async function verifyToken(token: string, secret: string): Promise<{ sub: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return { sub: payload.sub as string, email: payload.email as string };
  } catch {
    return null;
  }
}

// Auth: signup
app.post("/api/auth/signup", async (c) => {
  try {
    const { email, password } = await c.req.json().catch(() => ({} as any));
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return c.json({ error: "invalid_input" }, 400);
    }
    const exists = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (exists) return c.json({ error: "email_taken" }, 409);

    const pw = await hashPassword(password);
    await c.env.DB.prepare("INSERT INTO users (email, password_hash, created_at, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)")
      .bind(email, pw)
      .run();
    const row = await c.env.DB.prepare("SELECT last_insert_rowid() as id").first<{ id: number }>();
    const id = row?.id ?? 0;

    const jwt = await new SignJWT({ sub: String(id), email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(new TextEncoder().encode(c.env.JWT_SECRET));

    // 返回令牌作为响应的一部分，而不是设置 cookie
    return c.json({ id, email, token: jwt }, 201);
  } catch (e) {
    return c.json({ error: "internal_error", message: (e as Error).message }, 500);
  }
});

// Auth: login
app.post("/api/auth/login", async (c) => {
  try {
    const { email, password, remember } = await c.req.json().catch(() => ({} as any));
    if (!email || !password) return c.json({ error: "invalid_input" }, 400);
    const row = await c.env.DB.prepare("SELECT id, password_hash FROM users WHERE email = ?")
      .bind(email)
      .first<{ id: number; password_hash: string }>();
    if (!row) return c.json({ error: "invalid_credentials" }, 401);
    const ok = await verifyPassword(password, row.password_hash);
    if (!ok) return c.json({ error: "invalid_credentials" }, 401);

    // 设置令牌过期时间，根据是否记住登录状态
    const expirationTime = remember ? "30d" : "24h";
    
    const jwt = await new SignJWT({ sub: String(row.id), email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(expirationTime)
      .sign(new TextEncoder().encode(c.env.JWT_SECRET));

    // 返回令牌作为响应的一部分，而不是设置 cookie
    return c.json({ 
      id: row.id, 
      email, 
      token: jwt,
      expiresIn: remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 过期时间（秒）
    }, 200);
  } catch (e) {
    return c.json({ error: "internal_error", message: (e as Error).message }, 500);
  }
});

// Auth: me
app.get("/api/auth/me", async (c) => {
  const token = extractToken(c.req);
  if (!token) return c.json({ user: null }, 200);
  
  try {
    const payload = await verifyToken(token, c.env.JWT_SECRET);
    if (!payload) return c.json({ user: null }, 200);
    
    return c.json({ user: { id: payload.sub, email: payload.email } }, 200);
  } catch {
    return c.json({ user: null }, 200);
  }
});

// Auth: logout
app.post("/api/auth/logout", async (c) => {
  // 在无 cookie 方案中，登出操作主要在客户端完成（删除存储的令牌）
  // 服务器端只需返回成功状态
  return c.json({ ok: true }, 200);
});

// TEMP: Debug endpoint to inspect users by email
app.get("/api/admin/users", async (c) => {
  try {
    const url = new URL(c.req.url);
    const email = url.searchParams.get("email");
    if (email) {
      const rows = await c.env.DB.prepare(
        "SELECT id, email, datetime(created_at) as created_at FROM users WHERE email = ? ORDER BY datetime(created_at) DESC"
      ).bind(email).all();
      return c.json({ ok: true, users: rows.results }, 200);
    }
    const rows = await c.env.DB.prepare(
      "SELECT id, email, datetime(created_at) as created_at FROM users ORDER BY datetime(created_at) DESC LIMIT 50"
    ).all();
    return c.json({ ok: true, users: rows.results }, 200);
  } catch (e) {
    return c.json({ ok: false, error: (e as Error).message }, 500);
  }
});

export default {
  fetch: app.fetch,
};
