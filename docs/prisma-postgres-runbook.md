# Prisma / PostgreSQL 运行说明

默认 `DATA_BACKEND=json`，可直接运行。若要启用 PostgreSQL（推荐用于正式环境），按以下步骤执行。

## 本地 Docker 方式

```powershell
docker compose up -d postgres
npm.cmd run db:prepare
```

`db:prepare` 依次执行：

```powershell
npx.cmd prisma generate
npx.cmd prisma migrate deploy
npm.cmd run db:seed
npm.cmd run verify:prisma
```

验证通过后，将 `.env.local` 切换为：

```env
DATA_BACKEND="prisma"
```

然后重启 Next.js 服务。

## 当前机器判定

如果本机 PostgreSQL 或 Docker 未启动，`verify:prisma` 可能返回 `POSTGRES_UNAVAILABLE`，表示代码路径正常但数据库服务不可用。此时先启动数据库，再重新执行 `db:prepare`。
