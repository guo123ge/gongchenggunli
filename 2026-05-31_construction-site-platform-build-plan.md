# 施工现场综合管理平台 — 项目构建计划书

> **For Codex CLI:** 按 Phase 顺序逐任务执行，每个 Task 完成后 commit。
> **PRD 版本:** v1.0 | **计划日期:** 2026-05-31
> **总工期估算:** 14-20 周（3 个 Phase）

---

## 一、项目概述

**目标:** 搭建面向施工单位的现场综合管理平台，覆盖施工日志、材料、机械、安全、档案、变更签证六大模块，支持多角色协同 + 审核流 + PWA 离线。

**技术栈:**

| 层 | 技术选型 |
|---|---------|
| 框架 | Next.js 14 (App Router) + React 19 + TypeScript |
| 样式 | Tailwind CSS 4 + shadcn/ui |
| 状态管理 | Zustand (客户端) + React Query (服务端) |
| 离线存储 | Dexie.js (IndexedDB) |
| 数据库 ORM | Prisma + PostgreSQL |
| 认证 | NextAuth.js v5 (Credentials + JWT) |
| 文件存储 | 本地文件系统 (dev) → MinIO/S3 (prod) |
| 表单 | React Hook Form + Zod |
| PWA | next-pwa (Service Worker) |
| AI | OpenAI SDK (OCR / 风险识别 / 对话助手) |
| 测试 | Vitest + Playwright |
| 部署 | Vercel / Docker |

**项目路径:** `D:\construction-site-platform\`

---

## 二、项目目录结构（完整）

```
construction-site-platform/
├── .env.example
├── .env.local
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── postcss.config.mjs
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
│   ├── manifest.json
│   ├── sw.js
│   ├── icons/
│   └── logo.svg
├── src/
│   ├── app/
│   │   ├── layout.tsx              # 根布局（暗色主题 Provider）
│   │   ├── page.tsx                # 首页 → 重定向到 /dashboard
│   │   ├── globals.css             # Tailwind + 暗色主题变量
│   │   ├── providers.tsx           # QueryClient + Session + Theme
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx          # 侧边栏 + 顶栏 + 角色路由守卫
│   │   │   ├── dashboard/page.tsx  # 首页仪表盘
│   │   │   ├── daily-log/
│   │   │   │   ├── page.tsx        # 日志列表
│   │   │   │   ├── new/page.tsx    # 新建日志
│   │   │   │   └── [id]/page.tsx   # 日志详情
│   │   │   ├── material/
│   │   │   │   ├── page.tsx        # 库存看板
│   │   │   │   ├── stock-in/
│   │   │   │   │   ├── page.tsx    # 入库列表
│   │   │   │   │   └── new/page.tsx
│   │   │   │   └── stock-out/
│   │   │   │       ├── page.tsx
│   │   │   │       └── new/page.tsx
│   │   │   ├── machinery/
│   │   │   │   ├── page.tsx        # 机械看板
│   │   │   │   ├── new/page.tsx    # 机械进场
│   │   │   │   └── [id]/page.tsx   # 机械详情（保养/台班）
│   │   │   ├── safety/
│   │   │   │   ├── page.tsx        # 隐患列表
│   │   │   │   ├── hazards/
│   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   └── incidents/
│   │   │   │       ├── new/page.tsx
│   │   │   │       └── [id]/page.tsx
│   │   │   ├── archive/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── change-visa/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── changes/
│   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   └── visas/
│   │   │   │       ├── new/page.tsx
│   │   │   │       └── [id]/page.tsx
│   │   │   └── review/
│   │   │       └── page.tsx        # 审核中心（PM 专用）
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── [...nextauth]/route.ts
│   │       │   └── register/route.ts
│   │       ├── projects/
│   │       ├── daily-logs/
│   │       ├── materials/
│   │       ├── machinery/
│   │       ├── safety/
│   │       │   ├── hazards/
│   │       │   └── incidents/
│   │       ├── archives/
│   │       ├── changes/
│   │       ├── visas/
│   │       ├── review/
│   │       ├── upload/
│   │       ├── dashboard/
│   │       └── ai/
│   ├── components/
│   │   ├── ui/                     # shadcn/ui 组件
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── topbar.tsx
│   │   │   ├── command-palette.tsx
│   │   │   └── mobile-nav.tsx
│   │   ├── shared/
│   │   │   ├── status-badge.tsx     # 审核状态标签
│   │   │   ├── risk-badge.tsx       # 风险等级标签
│   │   │   ├── watermark-photo.tsx  # 图片水印组件
│   │   │   ├── image-upload.tsx     # 图片上传（拖拽+预览）
│   │   │   ├── voice-recorder.tsx   # 语音录制
│   │   │   ├── review-flow.tsx      # 审核操作按钮组
│   │   │   ├── draft-indicator.tsx  # 草稿自动保存提示
│   │   │   ├── confirm-dialog.tsx
│   │   │   └── data-table.tsx       # 通用数据表格
│   │   ├── dashboard/
│   │   │   ├── stat-cards.tsx       # 统计卡片
│   │   │   ├── pending-review.tsx
│   │   │   ├── recent-logs.tsx
│   │   │   ├── inventory-alerts.tsx
│   │   │   ├── safety-overview.tsx
│   │   │   └── maintenance-alerts.tsx
│   │   ├── daily-log/
│   │   │   ├── log-form.tsx
│   │   │   ├── log-detail.tsx
│   │   │   ├── log-card.tsx
│   │   │   ├── template-selector.tsx
│   │   │   └── labor-stats.tsx
│   │   ├── material/
│   │   │   ├── material-selector.tsx
│   │   │   ├── stock-in-form.tsx
│   │   │   ├── stock-out-form.tsx
│   │   │   ├── inventory-board.tsx
│   │   │   ├── ocr-result-view.tsx
│   │   │   └── material-ledger.tsx
│   │   ├── machinery/
│   │   │   ├── machinery-form.tsx
│   │   │   ├── machinery-detail.tsx
│   │   │   ├── maintenance-form.tsx
│   │   │   ├── shift-form.tsx
│   │   │   └── machinery-board.tsx
│   │   ├── safety/
│   │   │   ├── hazard-form.tsx
│   │   │   ├── hazard-detail.tsx
│   │   │   ├── incident-form.tsx
│   │   │   ├── rectification-flow.tsx
│   │   │   ├── heatmap.tsx
│   │   │   └── checklist.tsx
│   │   ├── archive/
│   │   │   ├── archive-upload-form.tsx
│   │   │   ├── archive-detail.tsx
│   │   │   ├── file-preview.tsx
│   │   │   ├── version-list.tsx
│   │   │   └── archive-checker.tsx
│   │   ├── change-visa/
│   │   │   ├── change-form.tsx
│   │   │   ├── visa-form.tsx
│   │   │   ├── quantity-table.tsx
│   │   │   └── cost-summary.tsx
│   │   └── ai/
│   │       ├── ai-chat-panel.tsx
│   │       ├── ai-chat-message.tsx
│   │       └── ai-analysis-result.tsx
│   ├── lib/
│   │   ├── auth.ts                 # NextAuth 配置
│   │   ├── db.ts                   # Prisma client 单例
│   │   ├── utils.ts                # cn(), formatDate, ...
│   │   ├── validators.ts           # Zod schemas（所有表单校验）
│   │   ├── constants.ts            # 天气选项、风险等级、材料分类等
│   │   ├── api-client.ts           # fetch 封装 + error handling
│   │   ├── permissions.ts          # RBAC 权限检查函数
│   │   ├── watermarks.ts           # Canvas 水印生成
│   │   └── ai.ts                   # OpenAI SDK 封装
│   ├── hooks/
│   │   ├── use-current-user.ts
│   │   ├── use-project.ts
│   │   ├── use-daily-logs.ts
│   │   ├── use-materials.ts
│   │   ├── use-machinery.ts
│   │   ├── use-safety.ts
│   │   ├── use-archives.ts
│   │   ├── use-changes.ts
│   │   ├── use-visas.ts
│   │   ├── use-review.ts
│   │   ├── use-offline-sync.ts
│   │   └── use-debounce.ts
│   ├── stores/
│   │   ├── app-store.ts            # 全局 UI 状态（侧边栏、主题）
│   │   ├── draft-store.ts          # 草稿管理（内存 + IndexedDB）
│   │   └── notification-store.ts
│   ├── db/
│   │   ├── index.ts                # Dexie 数据库定义
│   │   └── sync-queue.ts           # 离线同步队列
│   └── types/
│       ├── index.ts                # 所有 TypeScript 接口
│       ├── enums.ts                # 状态枚举
│       └── api.ts                  # API 请求/响应类型
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docs/
    ├── PRD.md
    └── api-spec.md
```

---

## 三、Phase 1 — MVP（核心闭环）[第 1-8 周]

### MVP 目标

完成 **用户系统 + 审核流引擎 + 施工日志模块 + 材料管理模块 + 首页仪表盘 + PWA 离线**，实现从录入到审核到归档的完整闭环。

---

### Phase 1 — Week 1: 项目初始化与基础设施

#### Task 1.1: 初始化 Next.js 项目

```bash
npx create-next-app@latest construction-site-platform --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd construction-site-platform
```

#### Task 1.2: 安装核心依赖

```bash
npm install prisma @prisma/client @auth/prisma-adapter next-auth@beta
npm install zustand react-hook-form @hookform/resolvers zod
npm install @tanstack/react-query dexie react-hot-toast
npm install lucide-react date-fns clsx tailwind-merge
npm install bcryptjs uuid
npm install -D @types/bcryptjs @types/uuid vitest @vitejs/plugin-react
```

#### Task 1.3: 初始化 shadcn/ui

```bash
npx shadcn@latest init  # 选择: TypeScript, Tailwind 4, CSS variables, Neutral base, 默认配置
npx shadcn@latest add button card input label select dialog dropdown-menu table tabs badge sheet avatar separator textarea toast tooltip command popover calendar form
```

#### Task 1.4: 配置 Tailwind 暗色主题

**创建:** `src/app/globals.css`

```css
@import "tailwindcss";

@theme {
  --color-gold-50: #fefce8;
  --color-gold-100: #fef9c3;
  --color-gold-200: #fef08a;
  --color-gold-300: #fde047;
  --color-gold-400: #facc15;
  --color-gold-500: #eab308;
  --color-gold-600: #ca8a04;
  --color-gold-700: #a16207;
  --color-gold-800: #854d0e;
  --color-gold-900: #713f12;

  --color-surface-50: #f8fafc;
  --color-surface-100: #f1f5f9;
  --color-surface-200: #e2e8f0;
  --color-surface-700: #334155;
  --color-surface-800: #1e293b;
  --color-surface-900: #0f172a;
  --color-surface-950: #020617;
}

:root {
  --background: #ffffff;
  --foreground: #0f172a;
}

.dark {
  --background: #0a0a0f;
  --foreground: #e2e8f0;
}
```

#### Task 1.5: 配置环境变量

**创建:** `.env.example`

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/construction_site"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
UPLOAD_DIR="./uploads"
OPENAI_API_KEY="sk-xxx"
```

---

### Phase 1 — Week 1-2: 数据库设计与 Prisma Schema

#### Task 1.6: 编写 Prisma Schema

**创建:** `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============ 用户与认证 ============

model User {
  id          String    @id @default(uuid())
  username    String    @unique
  displayName String
  phone       String
  avatar      String?
  passwordHash String
  globalRole  String    @default("user") // admin | user
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  projectMembers ProjectMember[]
  accounts       Account[]
  sessions       Session[]

  // 录入记录
  dailyLogs       DailyLog[]
  stockIns        StockIn[]
  stockOuts       StockOut[]
  hazards         SafetyHazard[]
  incidents       SafetyIncident[]
  archives        Archive[]
  changes         DesignChange[]
  visas           EngineeringVisa[]
  machinery       Machinery[]
  maintenanceRecords MaintenanceRecord[]
  shiftRecords    ShiftRecord[]

  // 审核记录
  reviewedDailyLogs    DailyLog[]     @relation("DailyLogReviewer")
  reviewedStockIns     StockIn[]      @relation("StockInReviewer")
  reviewedStockOuts    StockOut[]     @relation("StockOutReviewer")
  reviewedHazards      SafetyHazard[] @relation("HazardReviewer")
  reviewedIncidents    SafetyIncident[] @relation("IncidentReviewer")
  reviewedArchives     Archive[]      @relation("ArchiveReviewer")
  reviewedChanges      DesignChange[] @relation("ChangeReviewer")
  reviewedVisas        EngineeringVisa[] @relation("VisaReviewer")
  reviewedMachinery    Machinery[]    @relation("MachineryReviewer")
}

model Account {
  id                String  @id @default(uuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(uuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ============ 项目 ============

model Project {
  id              String   @id @default(uuid())
  name            String
  code            String   @unique
  location        String
  startDate       DateTime
  plannedEndDate  DateTime
  owner           String   // 建设单位
  contractor      String   // 施工单位
  supervisor      String?  // 监理单位
  status          String   @default("preparation") // preparation|in_progress|suspended|completed
  createdAt       DateTime @default(now())

  members         ProjectMember[]
  dailyLogs       DailyLog[]
  materials       Material[]
  machinery       Machinery[]
  safetyHazards   SafetyHazard[]
  safetyIncidents SafetyIncident[]
  archives        Archive[]
  designChanges   DesignChange[]
  engineeringVisas EngineeringVisa[]
}

model ProjectMember {
  id        String   @id @default(uuid())
  projectId String
  userId    String
  role      String   // PM|CON|TECH|SAFE|MAT|DOC|MACH
  joinedAt  DateTime @default(now())

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
}

// ============ 施工日志 ============

model DailyLog {
  id              String    @id @default(uuid())
  projectId       String
  workDate        DateTime
  weather         String    // 晴|阴|雨|雪|大风
  tempLow         Int
  tempHigh        Int
  workContent     String
  workPosition    String
  workProcess     String
  laborCount      Int
  laborDetail     String    // JSON: [{type, count}]
  machineryUsed   String    // JSON: string[]
  materialUsed    String    // JSON: [{name, quantity, unit}]
  qualityCheck    String?
  safetyCheck     String?

  status          String    @default("draft") // draft|submitted|approved|rejected
  submittedById   String
  reviewedById    String?
  reviewedAt      DateTime?
  reviewComment   String?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  project      Project @relation(fields: [projectId], references: [id])
  submittedBy  User    @relation(fields: [submittedById], references: [id])
  reviewedBy   User?   @relation("DailyLogReviewer", fields: [reviewedById], references: [id])
  attachments  Attachment[]
  audioNotes   AudioNote[]
}

model Attachment {
  id          String   @id @default(uuid())
  dailyLogId  String?
  stockInId   String?
  safetyHazardId String?
  safetyIncidentId String?
  archiveId   String?
  machineryId String?
  changeId    String?
  visaId      String?

  fileName    String
  filePath    String
  fileType    String
  fileSize    Int
  url         String
  hasWatermark Boolean @default(false)
  gpsLat      Float?
  gpsLng      Float?
  createdAt   DateTime @default(now())

  dailyLog  DailyLog?       @relation(fields: [dailyLogId], references: [id])
  stockIn   StockIn?        @relation(fields: [stockInId], references: [id])
  hazard    SafetyHazard?   @relation(fields: [safetyHazardId], references: [id])
  incident  SafetyIncident? @relation(fields: [safetyIncidentId], references: [id])
  archive   Archive?        @relation(fields: [archiveId], references: [id])
  machinery Machinery?      @relation(fields: [machineryId], references: [id])
  change    DesignChange?   @relation(fields: [changeId], references: [id])
  visa      EngineeringVisa? @relation(fields: [visaId], references: [id])
}

model AudioNote {
  id         String   @id @default(uuid())
  dailyLogId String
  fileName   String
  filePath   String
  transcript String?  // AI 语音转文字结果
  createdAt  DateTime @default(now())

  dailyLog DailyLog @relation(fields: [dailyLogId], references: [id])
}

// ============ 材料管理 ============

model Material {
  id           String   @id @default(uuid())
  projectId    String
  name         String
  category     String   // 钢筋|混凝土|木材|防水|装饰|其他
  spec         String
  unit         String   // 吨|m³|㎡|m|根|套
  safetyStock  Float    @default(0)
  currentStock Float    @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  project   Project    @relation(fields: [projectId], references: [id])
  stockIns  StockIn[]
  stockOuts StockOut[]

  @@unique([projectId, name, spec])
}

model StockIn {
  id             String    @id @default(uuid())
  projectId      String
  materialId     String
  billNo         String
  supplier       String
  quantity       Float
  unitPrice      Float?
  totalAmount    Float?
  batchNo        String?
  certificateUrl String?
  ocrResult      String?   // JSON

  status         String    @default("draft")
  submittedById  String
  reviewedById   String?
  reviewedAt     DateTime?
  reviewComment  String?
  createdAt      DateTime  @default(now())

  project      Project     @relation(fields: [projectId], references: [id])
  material     Material    @relation(fields: [materialId], references: [id])
  submittedBy  User        @relation(fields: [submittedById], references: [id])
  reviewedBy   User?       @relation("StockInReviewer", fields: [reviewedById], references: [id])
  attachments  Attachment[]
}

model StockOut {
  id            String    @id @default(uuid())
  projectId     String
  materialId    String
  billNo        String
  receiver      String
  purpose       String
  quantity      Float

  status        String    @default("draft")
  submittedById String
  reviewedById  String?
  reviewedAt    DateTime?
  reviewComment String?
  createdAt     DateTime  @default(now())

  project      Project  @relation(fields: [projectId], references: [id])
  material     Material @relation(fields: [materialId], references: [id])
  submittedBy  User     @relation(fields: [submittedById], references: [id])
  reviewedBy   User?    @relation("StockOutReviewer", fields: [reviewedById], references: [id])
}

// ============ 安全管理 ============

model SafetyHazard {
  id                    String    @id @default(uuid())
  projectId             String
  title                 String
  description           String
  location              String
  riskLevel             String    // low|medium|high|critical
  category              String
  rectificationRequired String?
  rectificationDeadline DateTime?
  responsiblePerson     String?
  rectificationResult   String?
  rectifiedAt           DateTime?

  status        String   @default("open") // open|rectifying|rectified|verified|closed
  submittedById String
  reviewedById  String?
  reviewedAt    DateTime?
  reviewComment String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  project              Project      @relation(fields: [projectId], references: [id])
  submittedBy          User         @relation(fields: [submittedById], references: [id])
  reviewedBy           User?        @relation("HazardReviewer", fields: [reviewedById], references: [id])
  photos               Attachment[]
  rectificationPhotos  Attachment[]?
}

model SafetyIncident {
  id              String    @id @default(uuid())
  projectId       String
  title           String
  incidentDate    DateTime
  incidentLocation String
  incidentType    String
  severity        String    // minor|moderate|major|critical
  description     String
  injured         Int       @default(0)
  fatal           Int       @default(0)
  cause           String?
  handling        String?
  reportUrl       String?

  status        String   @default("reported")
  submittedById String
  reviewedById  String?
  reviewedAt    DateTime?
  reviewComment String?
  createdAt     DateTime @default(now())

  project     Project      @relation(fields: [projectId], references: [id])
  submittedBy User         @relation(fields: [submittedById], references: [id])
  reviewedBy  User?        @relation("IncidentReviewer", fields: [reviewedById], references: [id])
  photos      Attachment[]
}

// ============ 档案管理 ============

model Archive {
  id           String   @id @default(uuid())
  projectId    String
  title        String
  category     String   // drawing|contract|test_report|construction_plan|technical_disclosure|acceptance_record|quality_record|meeting_memo|government_doc|other
  subCategory  String?
  description  String?
  tags         String   @default("[]") // JSON: string[]
  relatedTo    String   @default("[]") // JSON: [{type, id}]
  sealInfo     String?  // JSON

  status        String   @default("draft")
  submittedById String
  reviewedById  String?
  reviewedAt    DateTime?
  reviewComment String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  project     Project       @relation(fields: [projectId], references: [id])
  submittedBy User          @relation(fields: [submittedById], references: [id])
  reviewedBy  User?         @relation("ArchiveReviewer", fields: [reviewedById], references: [id])
  files       ArchiveFile[]
}

model ArchiveFile {
  id          String   @id @default(uuid())
  archiveId   String
  fileName    String
  fileType    String
  fileSize    Int
  version     Int      @default(1)
  versionNote String?
  filePath    String
  uploadedAt  DateTime @default(now())
  uploadedBy  String

  archive Archive @relation(fields: [archiveId], references: [id], onDelete: Cascade)
}

// ============ 机械管理 ============

model Machinery {
  id                  String   @id @default(uuid())
  projectId           String
  name                String
  category            String   // 起重|土方|混凝土|运输|其他
  model               String
  serialNo            String
  owner               String   // owned|leased
  supplier            String?
  entryDate           DateTime
  exitDate            DateTime?
  entryCondition      String?
  maintenanceCycle    Int      @default(30)
  lastMaintenanceDate DateTime?
  nextMaintenanceDate DateTime?

  status        String   @default("active") // active|maintenance|exited
  submittedById String
  reviewedById  String?
  reviewedAt    DateTime?
  reviewComment String?
  createdAt     DateTime @default(now())

  project             Project              @relation(fields: [projectId], references: [id])
  submittedBy         User                 @relation(fields: [submittedById], references: [id])
  reviewedBy          User?                @relation("MachineryReviewer", fields: [reviewedById], references: [id])
  photos              Attachment[]
  entryDocs           Attachment[]?
  maintenanceRecords  MaintenanceRecord[]
  shiftRecords        ShiftRecord[]
}

model MaintenanceRecord {
  id                  String   @id @default(uuid())
  machineryId         String
  date                DateTime
  type                String   // routine|repair|overhaul
  description         String
  cost                Float?
  nextMaintenanceDate DateTime?
  photos              String?  // JSON: file paths
  submittedById       String
  createdAt           DateTime @default(now())

  machinery   Machinery @relation(fields: [machineryId], references: [id])
  submittedBy User      @relation(fields: [submittedById], references: [id])
}

model ShiftRecord {
  id              String   @id @default(uuid())
  machineryId     String
  date            DateTime
  shiftCount      Float
  fuelUsed        Float?
  electricityUsed Float?
  workContent     String
  submittedById   String
  createdAt       DateTime @default(now())

  machinery   Machinery @relation(fields: [machineryId], references: [id])
  submittedBy User      @relation(fields: [submittedById], references: [id])
}

// ============ 变更签证 ============

model DesignChange {
  id             String   @id @default(uuid())
  projectId      String
  changeNo       String   @unique
  title          String
  changeType     String   // design|engineering
  changeReason   String
  changeContent  String
  affectedScope  String?
  estimatedCost  Float?
  actualCost     Float?
  costBearing    String?
  initiator      String?
  relatedParties String   @default("[]")

  status        String   @default("draft")
  submittedById String
  reviewedById  String?
  reviewedAt    DateTime?
  reviewComment String?
  createdAt     DateTime @default(now())

  project     Project      @relation(fields: [projectId], references: [id])
  submittedBy User         @relation(fields: [submittedById], references: [id])
  reviewedBy  User?        @relation("ChangeReviewer", fields: [reviewedById], references: [id])
  attachments Attachment[]
}

model EngineeringVisa {
  id                    String   @id @default(uuid())
  projectId             String
  visaNo                String   @unique
  title                 String
  visaType              String   // standard|material_machinery|minor
  visaReason            String
  visaContent           String
  constructionPosition  String
  quantities            String   // JSON: [{item, spec, unit, quantity, unitPrice, amount}]
  totalAmount           Float    @default(0)
  sealStatus            String   @default("none")

  status        String   @default("draft")
  submittedById String
  reviewedById  String?
  reviewedAt    DateTime?
  reviewComment String?
  createdAt     DateTime @default(now())

  project     Project      @relation(fields: [projectId], references: [id])
  submittedBy User         @relation(fields: [submittedById], references: [id])
  reviewedBy  User?        @relation("VisaReviewer", fields: [reviewedById], references: [id])
  attachments Attachment[]
}
```

#### Task 1.7: 生成 Prisma Client 并创建初始迁移

```bash
npx prisma migrate dev --name init
npx prisma generate
```

#### Task 1.8: 编写 Prisma 种子数据

**创建:** `prisma/seed.ts` — 包含测试项目、测试用户（6个角色 + PM）、示例材料目录

```bash
npx prisma db seed
```

---

### Phase 1 — Week 2: 认证系统与布局框架

#### Task 1.9: 实现 NextAuth 配置

**创建:** `src/lib/auth.ts` — Credentials Provider + JWT 策略，登录时验证 bcrypt 密码哈希，JWT payload 包含 userId / globalRole / projectRoles

#### Task 1.10: API 路由：注册与登录

**创建:** `src/app/api/auth/register/route.ts` — POST 注册新用户
**创建:** `src/app/api/auth/[...nextauth]/route.ts` — NextAuth 路由处理器

#### Task 1.11: 登录/注册页面

**创建:** `src/app/(auth)/login/page.tsx` — 暗色主题登录页（账号+密码+项目选择）
**创建:** `src/app/(auth)/register/page.tsx` — 注册页

#### Task 1.12: Dashboard 布局框架

**创建:** `src/app/(dashboard)/layout.tsx` — 侧边栏(可折叠) + 顶栏(Logo/面包屑/通知/用户菜单) + 角色路由守卫
**创建:** `src/components/layout/sidebar.tsx` — 根据角色显示不同菜单项
**创建:** `src/components/layout/topbar.tsx`

#### Task 1.13: Providers 配置

**创建:** `src/app/providers.tsx` — ThemeProvider + SessionProvider + QueryClientProvider + Toast

#### Task 1.14: RBAC 权限中间件

**创建:** `src/lib/permissions.ts` — canView(module, role) / canEdit(module, role) / canReview(role) 函数
**创建:** `src/middleware.ts` — Next.js 中间件，保护 /dashboard 路由

---

### Phase 1 — Week 3-4: 施工日志模块（端到端）

#### Task 1.15: 施工日志 API 路由

**创建:** `src/app/api/daily-logs/route.ts`
- `GET` — 分页查询（日期范围/状态/部位筛选），施工员只看自己的，PM 看全部
- `POST` — 创建日志（draft 或 submitted）

**创建:** `src/app/api/daily-logs/[id]/route.ts`
- `GET` — 日志详情
- `PATCH` — 更新草稿
- `DELETE` — 删除草稿

#### Task 1.16: 审核 API

**创建:** `src/app/api/review/route.ts`
- `POST` — approve/reject（body: {targetType, targetId, action, comment}）
- 验证调用者是 PM，审核通过后锁定记录

#### Task 1.17: 文件上传 API

**创建:** `src/app/api/upload/route.ts` — multer 处理文件上传，返回 URL + 文件信息

#### Task 1.18: Zod 校验 Schema

**创建:** `src/lib/validators.ts`

```typescript
export const dailyLogSchema = z.object({
  projectId: z.string().uuid(),
  workDate: z.date(),
  weather: z.enum(['晴','阴','雨','雪','大风']),
  tempLow: z.number().min(-50).max(60),
  tempHigh: z.number().min(-50).max(60),
  workContent: z.string().min(5),
  workPosition: z.string().min(1),
  workProcess: z.string().min(1),
  laborCount: z.number().min(0),
  // ...
});
```

#### Task 1.19: 施工日志列表页

**创建:** `src/app/(dashboard)/daily-log/page.tsx` — 卡片列表 + 筛选栏（日期/天气/状态）+ 分页

#### Task 1.20: 新建施工日志页

**创建:** `src/app/(dashboard)/daily-log/new/page.tsx` — 完整表单：
- 日期选择器、天气选择器、温度范围
- 施工内容/部位/工序 textarea
- 出勤人数 + 工种明细
- 机械/材料使用（多选）
- 质量/安全检查备注
- 照片上传（多张，自动水印）+ 语音录制
- 模板选择器（预设模板填充）
- 按钮："存为草稿"、"提交审核"

#### Task 1.21: 日志详情页

**创建:** `src/app/(dashboard)/daily-log/[id]/page.tsx` — 详情展示 + 审核操作组（PM 视角）

#### Task 1.22: 核心组件

**创建:** `src/components/daily-log/log-form.tsx` — 日志表单主组件（react-hook-form + Zod）
**创建:** `src/components/daily-log/log-card.tsx` — 列表卡片
**创建:** `src/components/daily-log/template-selector.tsx` — 模板选择弹窗

#### Task 1.23: 共享组件

**创建:** `src/components/shared/status-badge.tsx` — draft=灰 / submitted=蓝 / approved=绿 / rejected=红
**创建:** `src/components/shared/watermark-photo.tsx` — Canvas 水印：项目名+日期+GPS+部位
**创建:** `src/components/shared/image-upload.tsx` — 拖拽上传 + 预览 + 删除
**创建:** `src/components/shared/voice-recorder.tsx` — MediaRecorder API 录音 → 上传
**创建:** `src/components/shared/review-flow.tsx` — 审核按钮组（通过/驳回/退回修改）
**创建:** `src/components/shared/confirm-dialog.tsx`
**创建:** `src/components/shared/draft-indicator.tsx` — "草稿已自动保存" 提示

#### Task 1.24: 草稿自动保存

**创建:** `src/stores/draft-store.ts` — Zustand store，useDebounce 3 秒自动存 IndexedDB
**创建:** `src/db/index.ts` — Dexie 数据库：drafts 表 + syncQueue 表

#### Task 1.25: 施工日志模板数据

**创建:** `src/lib/constants.ts` — `DAILY_LOG_TEMPLATES` 数组（混凝土浇筑、钢筋绑扎、土方开挖等预设模板）

---

### Phase 1 — Week 5-6: 材料管理模块

#### Task 1.26: 材料 API 路由

**创建:** `src/app/api/materials/route.ts` — GET（材料目录列表+库存）/ POST（新增材料）
**创建:** `src/app/api/materials/[id]/route.ts` — GET/PATCH/DELETE

#### Task 1.27: 入库 API

**创建:** `src/app/api/materials/stock-in/route.ts` — GET/POST
**创建:** `src/app/api/materials/stock-in/[id]/route.ts` — GET/PATCH/DELETE

#### Task 1.28: 出库 API

**创建:** `src/app/api/materials/stock-out/route.ts` — GET/POST（含库存校验）
**创建:** `src/app/api/materials/stock-out/[id]/route.ts` — GET/PATCH/DELETE

#### Task 1.29: 库存看板页

**创建:** `src/app/(dashboard)/material/page.tsx` — 分类卡片 + 实时库存 + 低库存红色预警 + 搜索

#### Task 1.30: 入库/出库页面

**创建:** `src/app/(dashboard)/material/stock-in/page.tsx` — 入库列表
**创建:** `src/app/(dashboard)/material/stock-in/new/page.tsx` — 入库表单（含 OCR 照片上传）
**创建:** `src/app/(dashboard)/material/stock-out/page.tsx` — 出库列表
**创建:** `src/app/(dashboard)/material/stock-out/new/page.tsx` — 出库表单（选择材料时显示当前库存）

#### Task 1.31: 材料组件

**创建:** `src/components/material/inventory-board.tsx` — 库存看板图表
**创建:** `src/components/material/material-selector.tsx` — 材料搜索+选择组件
**创建:** `src/components/material/stock-in-form.tsx`
**创建:** `src/components/material/stock-out-form.tsx`

---

### Phase 1 — Week 7: 首页仪表盘 + 审核中心

#### Task 1.32: 仪表盘 API

**创建:** `src/app/api/dashboard/route.ts` — GET，返回：待审核数量/逾期数量、安全隐患统计、低库存材料数、保养到期机械数、最近日志、最近待审

#### Task 1.33: 首页仪表盘

**创建:** `src/app/(dashboard)/dashboard/page.tsx` — 根据角色显示不同内容：
- PM：四个统计卡片 + 最近日志 + 材料概况 + 安全隐患 + 待审批列表
- 一线人员：我的待修改 + 我的草稿 + 我的整改任务

#### Task 1.34: 仪表盘组件

**创建:** `src/components/dashboard/stat-cards.tsx` — 四卡片组（待审核/安全隐患/低库存/保养到期）
**创建:** `src/components/dashboard/pending-review.tsx` — 待审核列表摘要
**创建:** `src/components/dashboard/recent-logs.tsx` — 最近日志
**创建:** `src/components/dashboard/inventory-alerts.tsx` — 低库存预警
**创建:** `src/components/dashboard/safety-overview.tsx`
**创建:** `src/components/dashboard/maintenance-alerts.tsx`

#### Task 1.35: 审核中心页

**创建:** `src/app/(dashboard)/review/page.tsx` — PM 专属，Tab 切换各模块待审记录，统一审核操作

---

### Phase 1 — Week 8: PWA 离线 + 收尾

#### Task 1.36: PWA 配置

```bash
npm install next-pwa
```

**修改:** `next.config.ts` — 添加 withPWA 配置
**创建:** `public/manifest.json` — PWA manifest

#### Task 1.37: 离线同步机制

**创建:** `src/db/sync-queue.ts` — 在线/离线检测 → IndexedDB 队列 → 恢复网络后同步
**创建:** `src/hooks/use-offline-sync.ts` — navigator.onLine 监听 + 同步状态 hook

#### Task 1.38: 移动端适配

**修改:** 所有页面检查响应式布局 — iPhone SE (375px) 下可用
**创建:** `src/components/layout/mobile-nav.tsx` — 移动端底部导航栏

#### Task 1.39: Phase 1 集成测试

**创建:** `tests/e2e/phase1-workflow.spec.ts` — Playwright 测试完整闭环

```typescript
test('施工日志录入→审核完整流程', async ({ page }) => {
  // 1. 施工员登录 → 新建日志 → 提交
  // 2. 项目经经理登录 → 审核中心看到待审 → 审核通过
  // 3. 施工员再次查看 → 日志已锁定不可编辑
});
```

---

## 四、Phase 2 — 扩展模块 [第 9-14 周]

> Phase 2 沿用 Phase 1 的审核流引擎和基础组件，重点是新增三个模块 + AI OCR。

### Phase 2 — Week 9-10: 安全管理模块

#### Task 2.1: 安全隐患 API

**创建:** `src/app/api/safety/hazards/route.ts`
**创建:** `src/app/api/safety/hazards/[id]/route.ts`

#### Task 2.2: 安全事件 API

**创建:** `src/app/api/safety/incidents/route.ts`
**创建:** `src/app/api/safety/incidents/[id]/route.ts`

#### Task 2.3: 安全隐患页面

**创建:** `src/app/(dashboard)/safety/page.tsx` — 隐患列表（红/橙/黄风险标识）
**创建:** `src/app/(dashboard)/safety/hazards/new/page.tsx`
**创建:** `src/app/(dashboard)/safety/hazards/[id]/page.tsx` — 详情 + 整改流

#### Task 2.4: 安全事件页面

**创建:** `src/app/(dashboard)/safety/incidents/new/page.tsx`
**创建:** `src/app/(dashboard)/safety/incidents/[id]/page.tsx`

#### Task 2.5: 安全组件

**创建:** `src/components/safety/hazard-form.tsx`
**创建:** `src/components/safety/incident-form.tsx`
**创建:** `src/components/safety/rectification-flow.tsx` — 整改通知下发 → 回复 → 复查
**创建:** `src/components/safety/checklist.tsx` — JGJ59 检查表模板（脚手架/基坑/模板...）
**创建:** `src/components/shared/risk-badge.tsx` — low=绿 / medium=黄 / high=橙 / critical=红

---

### Phase 2 — Week 11: 机械管理模块

#### Task 2.6: 机械 API

**创建:** `src/app/api/machinery/route.ts`
**创建:** `src/app/api/machinery/[id]/route.ts`
**创建:** `src/app/api/machinery/[id]/maintenance/route.ts`
**创建:** `src/app/api/machinery/[id]/shifts/route.ts`

#### Task 2.7: 机械页面

**创建:** `src/app/(dashboard)/machinery/page.tsx` — 机械看板（在场/保养中/已退场）
**创建:** `src/app/(dashboard)/machinery/new/page.tsx` — 机械进场登记
**创建:** `src/app/(dashboard)/machinery/[id]/page.tsx` — 详情（保养记录+台班记录+维修表单）

#### Task 2.8: 机械组件

**创建:** `src/components/machinery/machinery-form.tsx`
**创建:** `src/components/machinery/machinery-board.tsx`
**创建:** `src/components/machinery/maintenance-form.tsx`
**创建:** `src/components/machinery/shift-form.tsx`

---

### Phase 2 — Week 12-13: 档案管理模块

#### Task 2.9: 档案 API

**创建:** `src/app/api/archives/route.ts` — 多条件筛选（分类/标签/日期）+ 全文搜索
**创建:** `src/app/api/archives/[id]/route.ts`
**创建:** `src/app/api/archives/[id]/files/route.ts` — 文件版本管理

#### Task 2.10: 档案页面

**创建:** `src/app/(dashboard)/archive/page.tsx` — 分类卡片 + 搜索
**创建:** `src/app/(dashboard)/archive/new/page.tsx` — 上传表单
**创建:** `src/app/(dashboard)/archive/[id]/page.tsx` — 详情 + 文件列表 + 版本历史

#### Task 2.11: 档案组件

**创建:** `src/components/archive/archive-upload-form.tsx`
**创建:** `src/components/archive/file-preview.tsx` — PDF/图片在线预览，DWG 提示下载
**创建:** `src/components/archive/version-list.tsx` — 版本历史列表
**创建:** `src/components/archive/archive-checker.tsx` — 归档完整性检查

---

### Phase 2 — Week 14: AI OCR 集成

#### Task 2.12: AI 服务层

**创建:** `src/lib/ai.ts` — OpenAI SDK 封装：
- `ocrImage(base64Image)` — OCR 识别单据（供应商/材料/数量/金额）
- `analyzeSafetyRisk(base64Image)` — 安全风险识别（安全帽/安全带/围栏）
- `extractTags(text)` — 智能标签提取
- `transcribeAudio(audioBuffer)` — 语音转文字

#### Task 2.13: AI OCR API

**创建:** `src/app/api/ai/ocr/route.ts` — POST 图片 → 返回 OCR 结果 JSON
**创建:** `src/app/api/ai/safety-check/route.ts` — POST 图片 → 返回风险分析
**创建:** `src/app/api/ai/transcribe/route.ts` — POST 音频 → 返回文字

#### Task 2.14: AI 结果展示组件

**创建:** `src/components/material/ocr-result-view.tsx` — OCR 结果预览 + 确认修正
**创建:** `src/components/ai/ai-analysis-result.tsx` — 安全风险分析结果展示

---

## 五、Phase 3 — AI 增强 + 报表 [第 15-20 周]

### Phase 3 — Week 15-16: 变更签证模块

#### Task 3.1: 设计变更 API

**创建:** `src/app/api/changes/route.ts`
**创建:** `src/app/api/changes/[id]/route.ts`

#### Task 3.2: 签证 API

**创建:** `src/app/api/visas/route.ts`
**创建:** `src/app/api/visas/[id]/route.ts`

#### Task 3.3: 变更签证页面

**创建:** `src/app/(dashboard)/change-visa/page.tsx` — 变更+签证台账（按金额排序）
**创建:** `src/app/(dashboard)/change-visa/changes/new/page.tsx`
**创建:** `src/app/(dashboard)/change-visa/changes/[id]/page.tsx`
**创建:** `src/app/(dashboard)/change-visa/visas/new/page.tsx`
**创建:** `src/app/(dashboard)/change-visa/visas/[id]/page.tsx`

#### Task 3.4: 变更签证组件

**创建:** `src/components/change-visa/change-form.tsx`
**创建:** `src/components/change-visa/visa-form.tsx`
**创建:** `src/components/change-visa/quantity-table.tsx` — 工程量表格（逐行添加+自动计算合价+总金额）
**创建:** `src/components/change-visa/cost-summary.tsx`

---

### Phase 3 — Week 17-18: AI 对话助手

#### Task 3.5: AI Chat API

**创建:** `src/app/api/ai/chat/route.ts` — POST 消息 → LLM + RAG 回答，流式 SSE 输出

#### Task 3.6: AI 对话助手组件

**创建:** `src/components/ai/ai-chat-panel.tsx` — 右下角悬浮助手面板
**创建:** `src/components/ai/ai-chat-message.tsx` — 消息气泡（用户/AI）
**修改:** `src/app/(dashboard)/layout.tsx` — 嵌入 AI 助手面板

#### Task 3.7: RAG 知识库

**创建:** `src/lib/rag.ts` — 项目数据向量化 + 相似检索（存数据库向量字段）

---

### Phase 3 — Week 19-20: 报表导出 + 收尾

#### Task 3.8: 施工周报/月报

**创建:** `src/app/api/reports/daily-log-summary/route.ts` — 生成周报/月报数据

#### Task 3.9: 材料台账报表

**创建:** `src/app/api/reports/material-ledger/route.ts` — 收发存汇总

#### Task 3.10: Excel 导出

**创建:** `src/lib/export.ts` — 使用 exceljs 或 xlsx 库生成 Excel 文件
**创建:** `src/app/api/export/[type]/route.ts` — 统一导出接口

#### Task 3.11: 安全风险热力图

**创建:** `src/components/safety/heatmap.tsx` — 按施工区域展示隐患分布（recharts 热力图）

#### Task 3.12: 命令面板 ⌘K

**创建:** `src/components/layout/command-palette.tsx` — cmdk 快速操作面板（新建日志/搜索材料/跳转页面）

#### Task 3.13: 通知系统

**创建:** `src/app/api/notifications/route.ts` — 整改到期/审核逾期/低库存提醒
**创建:** `src/stores/notification-store.ts`

---

## 六、数据库查询关键点

### 库存实时计算（避免数据不一致）

入库审核通过后，通过 Prisma 事务更新 `Material.currentStock`：

```typescript
await prisma.$transaction([
  prisma.stockIn.update({ where: { id }, data: { status: 'approved' } }),
  prisma.material.update({
    where: { id: materialId },
    data: { currentStock: { increment: quantity } }
  })
]);
```

出库审核通过后递减库存，**先校验库存充足**：

```typescript
const material = await prisma.material.findUnique({ where: { id: materialId } });
if (material.currentStock < quantity) {
  throw new Error('库存不足');
}
```

### RBAC 查询模式

所有 API 查询加上项目级 + 角色级过滤：

```typescript
// 施工员只能查自己的日志
if (userProjectRole === 'CON') {
  where.submittedById = userId;
}
// PM 可以查项目下所有日志
```

---

## 七、关键命令速查

```bash
# 开发环境启动
npm run dev

# 数据库操作
npx prisma studio                    # 可视化数据库
npx prisma migrate dev --name xxx    # 创建迁移
npx prisma db seed                   # 种子数据

# 测试
npx vitest                           # 单元测试
npx playwright test                  # E2E 测试

# 构建
npm run build
npm start

# 代码质量
npx eslint src/ --fix
npx prettier --write src/
```

---

## 八、Codex 执行建议

### 执行顺序

1. **严格按 Phase 1 → 2 → 3 顺序执行**，每个 Phase 内部按 Task 编号顺序
2. 每个 Task 完成后 `git add` + `git commit -m "feat(module): task description"`
3. Task 1.1-1.5（项目初始化）一次性完成
4. Task 1.6（Prisma Schema）是整个项目的数据基础，必须最先完成
5. 每个模块的 4 个 Task 顺序：API → 校验 → 页面 → 组件

### 给 Codex 的提示词模板

```
根据构建计划书 D:\construction-site-platform\.hermes\plans\2026-05-31_construction-site-platform-build-plan.md
请完成 Task X.Y: [任务名称]
当前项目路径: D:\construction-site-platform\
技术栈: Next.js 14 + Prisma + Tailwind 4 + shadcn/ui + TypeScript
严格按照计划书中的文件路径和代码结构执行。
```

### 风险提示

| 风险 | 应对 |
|------|------|
| Prisma Schema 字段遗漏 | 执行前对照 PRD 数据模型逐字段检查 |
| shadcn/ui 组件缺失 | 按需 `npx shadcn@latest add <component>` |
| 审核流逻辑复杂 | Phase 1 先做好可复用的 `review-flow.tsx` 组件 |
| 离线同步冲突 | Phase 1 先做简单版本（最后写入胜），Phase 3 再优化 |
| 文件上传大小限制 | next.config.ts 中配置 `bodySizeLimit: '50mb'` |

---

*计划结束。此文档可直接提交给 Codex CLI 按 Task 顺序执行。*
