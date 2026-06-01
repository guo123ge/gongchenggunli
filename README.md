# 施工现场综合管理平台

根据 `C:\Users\Administrator\Desktop\施工现场综合管理平台\2026-05-31_construction-site-platform-build-plan.md` 创建的 Next.js 项目。

## 已落地能力

- 六大模块：施工日志、材料、机械、安全、档案、变更签证。
- Phase 1 闭环：仪表盘、施工日志录入/详情/审核、材料入库/出库/库存预警、审核中心。
- 多角色/RBAC 基础：PM、施工员、技术、安全、材料、资料、机械管理员。
- PWA/离线基础：manifest、service worker、Dexie 草稿和同步队列。
- AI 扩展位：OCR、安全风险识别、语音转写、AI Chat + RAG 检索。
- 报表导出：施工日志汇总、材料台账、CSV 导出。

## 运行

```bash
npm.cmd install
npx.cmd prisma generate
npm.cmd run dev
```

默认访问：

```text
http://localhost:3000/dashboard
```

演示账号：

```text
pm / 123456
con / 123456
mat / 123456
safe / 123456
```

## 验证

```bash
npm.cmd run lint
npm.cmd run build
```

当前项目使用 Next.js 14.2.32、React 18.3.1、Prisma 6.19.0，以匹配计划书中的 Next 14 架构并避开当前 Windows 环境下 Next 16/SWC 的兼容问题。

## 数据库模式

默认 `DATA_BACKEND=json`，使用 `.local-data/store.json` 作为本地可运行数据层。

如果本机安装了 Docker/PostgreSQL，可切换到 Prisma/PostgreSQL：

```bash
docker compose up -d postgres
npm.cmd run prisma:migrate -- --name init
npm.cmd run db:seed
```

然后把 `.env.local` 改为：

```env
DATA_BACKEND="prisma"
```

可用以下命令验证数据库模式：

```bash
npm.cmd run verify:prisma
```

如果本机没有 PostgreSQL 或 Docker，会看到 `Can't reach database server at localhost:5432`。这表示代码已进入 Prisma 连接阶段，但数据库服务尚未启动。
