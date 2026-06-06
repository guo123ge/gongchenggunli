import fs from "node:fs";
import path from "node:path";

const envFile = process.env.ENV_FILE ?? ".env.production";
const envPath = path.resolve(process.cwd(), envFile);
const checks = [];

if (!fs.existsSync(envPath)) {
  fail(`未找到 ${envFile}。请先在项目根目录创建生产环境变量文件。`);
  print();
  process.exit(1);
}

const env = parseEnvFile(fs.readFileSync(envPath, "utf8"));

required("NEXTAUTH_SECRET", "登录会话密钥必须填写，不能使用默认占位值。", { reject: ["change-me-in-production", "请替换为上一步生成的随机密钥"] });
required("NEXTAUTH_URL", "生产访问地址必须填写。");
required("PUBLIC_PRIMARY_DOMAIN", "对外主入口必须填写。");
required("UPLOAD_DIR", "上传目录必须填写。");
oneOf("DATA_BACKEND", ["json", "prisma"], "数据后端只能是 json 或 prisma。");

if (env.NEXTAUTH_URL && env.PUBLIC_PRIMARY_DOMAIN && normalizeUrl(env.NEXTAUTH_URL) !== normalizeUrl(env.PUBLIC_PRIMARY_DOMAIN)) {
  warn("NEXTAUTH_URL 与 PUBLIC_PRIMARY_DOMAIN 不一致，请确认登录回调地址是否符合当前访问入口。");
}

if (env.NEXTAUTH_URL?.startsWith("http://") && !isIpOrLocalhost(env.NEXTAUTH_URL)) {
  warn("NEXTAUTH_URL 使用 HTTP 域名。正式域名备案和证书完成后建议改为 HTTPS。");
}

checkUploadDir(env.UPLOAD_DIR);
checkCos();
checkAsr();
checkOptional("OPENAI_API_KEY", "未配置 OpenAI，图片/语音的云端备用能力将不可用。");

print();
process.exit(checks.some((item) => item.level === "error") ? 1 : 0);

function checkCos() {
  const keys = ["TENCENT_COS_REGION", "TENCENT_COS_BUCKET", "TENCENT_COS_PUBLIC_BASE_URL", "TENCENT_COS_SECRET_ID", "TENCENT_COS_SECRET_KEY"];
  const filled = keys.filter((key) => hasValue(key));
  if (filled.length === 0) {
    warn("未配置腾讯云 COS，上传将使用本地 uploads 目录。");
    return;
  }
  for (const key of keys) required(key, "启用腾讯云 COS 时该变量必须填写。");
  oneOf("TENCENT_COS_ACCESS_MODE", ["private", "public"], "COS 访问模式只能是 private 或 public。");
  ok("腾讯云 COS 配置项已填写。");
}

function checkAsr() {
  const keys = ["TENCENT_ASR_REGION", "TENCENT_ASR_SECRET_ID", "TENCENT_ASR_SECRET_KEY", "TENCENT_ASR_ENGINE_MODEL_TYPE"];
  const filled = keys.filter((key) => hasValue(key));
  if (filled.length === 0 || (filled.length === 2 && hasValue("TENCENT_ASR_REGION") && hasValue("TENCENT_ASR_ENGINE_MODEL_TYPE"))) {
    warn("未配置腾讯云 ASR，语音文件会保存，但真实转写不可用。");
    return;
  }
  for (const key of keys) required(key, "启用腾讯云 ASR 时该变量必须填写。");
  ok("腾讯云 ASR 配置项已填写。");
}

function checkUploadDir(value) {
  if (!value) return;
  const uploadDir = path.resolve(process.cwd(), value);
  if (!fs.existsSync(uploadDir)) {
    warn(`上传目录不存在：${uploadDir}。部署时请先创建该目录。`);
    return;
  }
  try {
    fs.accessSync(uploadDir, fs.constants.W_OK);
    ok(`上传目录可写：${uploadDir}`);
  } catch {
    fail(`上传目录不可写：${uploadDir}`);
  }
}

function required(key, message, options = {}) {
  const value = env[key]?.trim() ?? "";
  if (!value || options.reject?.includes(value)) {
    fail(`${key} 未正确填写。${message}`);
    return;
  }
  ok(`${key} 已填写。`);
}

function checkOptional(key, message) {
  if (hasValue(key)) ok(`${key} 已填写。`);
  else warn(message);
}

function oneOf(key, values, message) {
  const value = env[key]?.trim();
  if (!value) return;
  if (!values.includes(value)) fail(`${key}=${value} 不合法。${message}`);
  else ok(`${key}=${value}`);
}

function hasValue(key) {
  const value = env[key]?.trim() ?? "";
  return Boolean(value && !value.startsWith("请在服务器内填写") && value !== "服务器中填写");
}

function parseEnvFile(content) {
  const result = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    result[key] = value;
  }
  return result;
}

function normalizeUrl(value) {
  return value.replace(/\/+$/, "");
}

function isIpOrLocalhost(value) {
  try {
    const host = new URL(value).hostname;
    return host === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(host);
  } catch {
    return false;
  }
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
  console.log(`\n生产配置核对：${envFile}\n`);
  for (const item of checks) {
    console.log(`[${icon[item.level]}] ${item.message}`);
  }
  const summary = checks.reduce(
    (acc, item) => {
      acc[item.level] += 1;
      return acc;
    },
    { ok: 0, warn: 0, error: 0 },
  );
  console.log(`\n汇总：通过 ${summary.ok} 项，提醒 ${summary.warn} 项，错误 ${summary.error} 项。`);
}
