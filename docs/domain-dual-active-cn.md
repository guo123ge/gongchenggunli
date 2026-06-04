# 腾讯云正式域名发布说明

## 当前域名状态

- 主域名：`guo123guo.cn`
- 云厂商：腾讯云
- 实名认证：已完成
- ICP 备案：审核中
- 备用域名：暂不启用

## 当前可执行事项

备案审核期间，建议先完成服务器、数据库、对象存储、环境变量和健康检查配置。备案通过后，再完成域名解析、HTTPS 证书和公网访问验收。

## 正式入口标准

- 主入口：`https://guo123guo.cn/login?callbackUrl=%2Fdashboard`
- 健康检查：`https://guo123guo.cn/api/health`
- 本地预览：`http://127.0.0.1:3000/login?callbackUrl=%2Fdashboard`

## 腾讯云环境变量建议

```env
NEXTAUTH_URL="https://guo123guo.cn"
PUBLIC_PRIMARY_DOMAIN="https://guo123guo.cn"
PUBLIC_SECONDARY_DOMAIN=""
DATA_BACKEND="prisma"
DATABASE_URL="postgresql://正式数据库账号:正式数据库密码@正式数据库地址:5432/construction_site"
NEXTAUTH_SECRET="生产环境高强度随机密钥"
BLOB_READ_WRITE_TOKEN="对象存储或 Blob 写入密钥"
BLOB_PUBLIC_URL="https://正式附件公开访问域名"
```

## 备案通过后的发布步骤

1. 在腾讯云 DNSPod 将 `guo123guo.cn` 解析到正式服务器或负载均衡。
2. 为 `guo123guo.cn` 配置 HTTPS 证书，并强制 HTTP 跳转 HTTPS。
3. 在腾讯云服务器部署当前稳定版本代码。
4. 执行数据库迁移与种子数据初始化。
5. 启动生产服务，并确认 `/api/health` 返回 `ok: true`。
6. 打开 `https://guo123guo.cn/login?callbackUrl=%2Fdashboard` 验证登录、会话、上传和核心模块。

## 备用域名策略

当前没有备用域名，因此正式上线初期按单主域名运行。后续如需恢复双活，可新增一个备用域名或 Vercel 备用入口，并配置：

```env
PUBLIC_SECONDARY_DOMAIN="https://备用域名"
```

新增备用入口后，需要使用同一版本代码、同一数据库、同一附件存储，并分别验证登录回调和上传下载。
