# 施工现场综合管理平台

基于 Next.js 14 的施工现场管理系统，覆盖施工日志、材料、机械、安全、档案、变更签证与审核中心。

## 已实现能力

- 业务模块：施工日志、材料管理、机械管理、安全管理、档案管理、变更签证、审核中心。
- 审核闭环：提交、通过、驳回、退回修改。
- 角色体系：`PM`、`CON`、`TECH`、`SAFE`、`MAT`、`DOC`、`MACH`。
- 中文角色：项目经理、施工员、技术负责人、安全员、材料员、资料员、机械管理员。
- 智能能力：单据识别、安全风险识别、语音转写、项目知识检索。
- 上传能力：默认本地 `uploads/`，正式环境可切换到对象存储或 Blob。
- 数据后端：本地默认 JSON，正式环境推荐 Prisma + PostgreSQL。

## 本地预览

```bash
npm.cmd install
npx.cmd prisma generate
npm.cmd run build
npm.cmd run start -- -p 3000
```

本地入口：

```text
http://127.0.0.1:3000/login?callbackUrl=%2Fdashboard
```

演示账号：

```text
pm / 123456
con / 123456
tech / 123456
safe / 123456
mat / 123456
doc / 123456
mach / 123456
```

## 腾讯云正式域名

- 主域名：`guo123guo.cn`
- 云厂商：腾讯云
- 实名认证：已完成
- ICP 备案：审核中
- 备用域名：暂不启用

备案通过后的正式入口：

```text
https://guo123guo.cn/login?callbackUrl=%2Fdashboard
```

健康检查：

```text
https://guo123guo.cn/api/health
```

## 正式环境变量

```env
NEXTAUTH_URL="https://guo123guo.cn"
PUBLIC_PRIMARY_DOMAIN="https://guo123guo.cn"
PUBLIC_SECONDARY_DOMAIN=""
DATA_BACKEND="prisma"
DATABASE_URL="postgresql://正式数据库账号:正式数据库密码@正式数据库地址:5432/construction_site"
NEXTAUTH_SECRET="生产环境高强度随机密钥"
UPLOAD_DIR="./uploads"
BLOB_READ_WRITE_TOKEN=""
BLOB_PUBLIC_URL=""
```

## 国内浏览器兼容目标

- 手机端：微信内置浏览器、QQ 浏览器、华为浏览器、夸克、UC、360 手机浏览器。
- 电脑端：Chrome、Edge、360 安全浏览器、QQ 浏览器。
- 重点验证：登录回调、会话保持、上传下载、审核流、智能功能回退。

## 验证命令

```bash
npm.cmd run lint
npm.cmd run build
npm.cmd run verify:phase1
npm.cmd run verify:extended
npm.cmd run verify:ai
```

腾讯云发布说明见 [domain-dual-active-cn.md](/D:/construction-site-platform/docs/domain-dual-active-cn.md)。
Prisma 模式切换见 [prisma-postgres-runbook.md](/D:/construction-site-platform/docs/prisma-postgres-runbook.md)。
