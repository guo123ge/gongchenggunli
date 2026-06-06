import dns from "node:dns/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const timeoutMs = Number(process.env.HEALTH_TIMEOUT_MS ?? 8000);
const targetUrl = normalizeBaseUrl(process.env.PUBLIC_URL ?? process.env.PUBLIC_PRIMARY_DOMAIN ?? "http://127.0.0.1:3000");
const expectedHost = process.env.EXPECTED_HOST ?? "";
const checks = [];

await checkUrl("/api/health", "健康接口", validateHealth);
await checkUrl("/login?callbackUrl=%2Fdashboard", "登录入口", validateHtml);
await checkCssFromLogin();
await checkPort3000();
await checkPm2();
await checkNginx();
await checkDns();

print();
process.exit(checks.some((item) => item.level === "error") ? 1 : 0);

async function checkCssFromLogin() {
  const response = await fetchWithTimeout(`${targetUrl}/login?callbackUrl=%2Fdashboard`);
  if (!response.ok) return;
  const html = await response.text();
  const cssPath = html.match(/href="([^"]+\.css[^"]*)"/)?.[1];
  if (!cssPath) {
    warn("登录页未找到 CSS 资源链接，请检查 Next.js 静态资源输出。");
    return;
  }
  const cssUrl = new URL(cssPath, targetUrl).toString();
  const cssResponse = await fetchWithTimeout(cssUrl);
  if (!cssResponse.ok) {
    fail(`CSS 资源不可访问：${cssUrl}，状态码 ${cssResponse.status}`);
    return;
  }
  const css = await cssResponse.text();
  if (css.length < 1000) {
    warn(`CSS 资源内容偏小：${css.length} 字节，请确认样式是否完整。`);
    return;
  }
  ok(`CSS 资源正常：${css.length} 字节。`);
}

async function checkUrl(path, label, validator) {
  try {
    const response = await fetchWithTimeout(`${targetUrl}${path}`);
    if (!response.ok) {
      fail(`${label}不可访问：${path}，状态码 ${response.status}`);
      return;
    }
    await validator(response, label);
  } catch (error) {
    fail(`${label}请求失败：${error instanceof Error ? error.message : String(error)}`);
  }
}

async function validateHealth(response) {
  const body = await response.json().catch(() => null);
  if (!body?.ok) {
    fail(`健康接口返回异常：${JSON.stringify(body)}`);
    return;
  }
  ok(`健康接口正常：${body.data?.service ?? "服务已响应"}。`);
}

async function validateHtml(response, label) {
  const html = await response.text();
  if (html.includes("Unhandled Runtime Error") || html.includes("Hydration failed")) {
    fail(`${label}包含运行时错误覆盖层。`);
    return;
  }
  if (!html.includes("施工现场综合管理平台") && !html.includes("登录施工平台")) {
    warn(`${label}已响应，但未识别到平台关键文案。`);
    return;
  }
  ok(`${label}正常响应。`);
}

async function checkPort3000() {
  const isWindows = process.platform === "win32";
  const command = isWindows ? "powershell.exe" : "bash";
  const args = isWindows
    ? ["-NoProfile", "-Command", "Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1 | ForEach-Object { $_.OwningProcess }"]
    : ["-lc", "ss -ltn '( sport = :3000 )' | tail -n +2 | head -n 1"];
  const result = await tryExec(command, args);
  if (!result.ok || !result.stdout.trim()) {
    warn("未检测到本机 3000 端口监听。若通过 Nginx 代理到其他端口，请确认配置一致。");
    return;
  }
  ok("本机 3000 端口正在监听。");
}

async function checkPm2() {
  const result = await tryExec("pm2", ["jlist"]);
  if (!result.ok) {
    warn("未检测到 PM2，服务器部署时请确认已安装并启动 gongchenggunli 进程。");
    return;
  }
  const processes = JSON.parse(result.stdout || "[]");
  const app = processes.find((item) => item.name === "gongchenggunli");
  if (!app) {
    warn("PM2 已安装，但未找到 gongchenggunli 进程。");
    return;
  }
  if (app.pm2_env?.status !== "online") {
    fail(`PM2 进程 gongchenggunli 状态异常：${app.pm2_env?.status ?? "未知"}`);
    return;
  }
  ok("PM2 进程 gongchenggunli 在线。");
}

async function checkNginx() {
  const result = await tryExec("nginx", ["-t"]);
  if (!result.ok) {
    warn("未检测到可用 Nginx 或 nginx -t 未通过。服务器部署时请单独确认反向代理配置。");
    return;
  }
  ok("Nginx 配置检测通过。");
}

async function checkDns() {
  const host = new URL(targetUrl).hostname;
  if (host === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    warn("当前目标是本机或 IP 地址，跳过域名解析检查。");
    return;
  }
  try {
    const addresses = await dns.resolve4(host);
    if (expectedHost && !addresses.includes(expectedHost)) {
      warn(`${host} 已解析，但未解析到期望 IP ${expectedHost}。当前：${addresses.join(", ")}`);
      return;
    }
    ok(`${host} DNS 解析正常：${addresses.join(", ")}。`);
  } catch (error) {
    fail(`${host} DNS 解析失败：${error instanceof Error ? error.message : String(error)}`);
  }
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function tryExec(command, args) {
  try {
    const { stdout, stderr } = await execFileAsync(command, args, { timeout: timeoutMs });
    return { ok: true, stdout, stderr };
  } catch (error) {
    return { ok: false, stdout: error.stdout ?? "", stderr: error.stderr ?? "", message: error.message };
  }
}

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, "");
}

function ok(message) {
  checks.push({ level: "ok", message });
}

function warn(message) {
  checks.push({ level: "warn", message });
}

function fail(message) {
  checks.push({ level: "error", message });
}

function print() {
  const icon = { ok: "通过", warn: "提醒", error: "错误" };
  console.log(`\n部署健康检查：${targetUrl}\n`);
  for (const item of checks) console.log(`[${icon[item.level]}] ${item.message}`);
  const summary = checks.reduce(
    (acc, item) => {
      acc[item.level] += 1;
      return acc;
    },
    { ok: 0, warn: 0, error: 0 },
  );
  console.log(`\n汇总：通过 ${summary.ok} 项，提醒 ${summary.warn} 项，错误 ${summary.error} 项。`);
}
