# BIM.Core (Rebar Quant) 产品优化实施计划

> **目标：** 对项目 `D:\赛博土木AI课程\工程量计算\gongchengliang001` 实施 8 项产品优化，
> 覆盖持久化、冷启动、AI 安全、流式输出、PDF 导入、性能优化等四个方面。
>
> **技术栈：** Next.js 14 + TypeScript + Three.js + Zustand + Tailwind CSS + IndexedDB
>
> **总工期：** 8-13 天（4 阶段）

---

## ⚠️ 执行前必读

**在开始任何修改前，先执行以下操作：**

```bash
cd D:\赛博土木AI课程\工程量计算\gongchengliang001
git status                    # 确认工作区干净
git checkout -b feat/product-optimization  # 创建功能分支
npm install                   # 确保依赖已安装
```

**验证项目能跑起来：**
```bash
npm run dev
# 打开 http://localhost:3000，确认 3D 场景正常渲染
```

---

## 阶段一：基础修复（1-2天）

### Task 1.1：冷启动体验优化 — 移除自动添加 + 欢迎空状态

**目标：** 用户首次打开应用看到引导界面，而非随机创建的构件。

**文件：**
- 修改：`app/page.tsx`
- 新建：`components/WelcomeEmpty.tsx`（如尚不存在）

**Step 1：检查当前状态**

```bash
# 检查 page.tsx 是否还有自动添加 effect
grep -n "addComponent\|useEffect.*components.length" app/page.tsx
```

如果 page.tsx 第 29-35 行有类似以下代码，说明还未移除：
```typescript
useEffect(() => {
  if (components.length === 0) {
    addComponent("COLUMN");
    addComponent("BEAM");
  }
}, []);
```
**删除它。** 如果没有这段代码，说明已修复，跳过。

**Step 2：确认 WelcomeEmpty 集成**

检查 `app/page.tsx` 中 3D 视口区域（约第 170 行）是否有条件渲染：

```typescript
{components.length === 0 ? (
  <WelcomeEmpty />
) : (
  <>
    <Scene3D />
    <SceneToolbar />
    ...
  </>
)}
```

如果没有，在 3D 视口的 `<div ref={viewportRef}>` 内部用上述代码包裹 Scene3D 和 SceneToolbar。

同时确保文件顶部已导入：
```typescript
import WelcomeEmpty from "@/components/WelcomeEmpty";
```

**Step 3：创建 WelcomeEmpty.tsx（如不存在）**

如果 `components/WelcomeEmpty.tsx` 不存在，创建它：

```typescript
"use client";
import { HardHat, Box, Columns, Square, Circle, ArrowRight,
  RectangleHorizontal, MoveUpRight, Triangle, Minus, Hexagon, Grid3X3 } from "lucide-react";
import { useStore } from "@/lib/store";
import type { ComponentType } from "@/lib/types";

const TYPE_GROUPS: {
  name: string;
  types: { t: ComponentType; code: string; label: string; desc: string; icon: any; color: string }[];
}[] = [
  {
    name: "上部结构",
    types: [
      { t: "BEAM",       code: "KL",  label: "梁 KL",   desc: "框架梁",   icon: Box,                 color: "text-blue-400" },
      { t: "COLUMN",     code: "KZ",  label: "柱 KZ",   desc: "框架柱",   icon: Columns,             color: "text-emerald-400" },
      { t: "SHEAR_WALL", code: "Q",   label: "墙 Q",    desc: "剪力墙",   icon: RectangleHorizontal, color: "text-purple-400" },
      { t: "SLAB",       code: "LB",  label: "板 LB",   desc: "楼板",     icon: Square,              color: "text-violet-400" },
      { t: "STAIR",      code: "LT",  label: "楼梯 LT", desc: "AT型楼梯", icon: MoveUpRight,         color: "text-cyan-400" },
    ],
  },
  {
    name: "基础",
    types: [
      { t: "FOUND",       code: "DJ", label: "独基 DJ", desc: "独立基础",   icon: Triangle, color: "text-amber-400" },
      { t: "STRIP_FOUND", code: "TJ", label: "条基 TJ", desc: "条形基础",   icon: Minus,    color: "text-orange-400" },
      { t: "PILE_CAP",    code: "CT", label: "承台 CT", desc: "桩基承台",   icon: Hexagon,  color: "text-red-400" },
      { t: "PILE",        code: "ZJ", label: "桩 ZJ",   desc: "灌注桩",     icon: Circle,   color: "text-rose-400" },
      { t: "RAFT",        code: "FB", label: "筏板 FB", desc: "筏板基础",   icon: Grid3X3,  color: "text-pink-400" },
    ],
  },
];

export default function WelcomeEmpty() {
  const addComponent = useStore((s) => s.addComponent);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f172a] select-none overflow-auto py-8">
      <div className="flex items-center gap-3 mb-4">
        <HardHat className="w-9 h-9 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">BIM.Core Reinforced</h1>
          <p className="text-xs text-slate-400">22G101 平法工程量计算 · 3D 配筋可视化</p>
        </div>
      </div>
      <p className="text-slate-500 text-xs mb-6 text-center">
        支持平法校验 · DXF 蓝图导入 · AI 辅助设计 · Excel/Word 报表
      </p>
      <div className="space-y-4 mb-6 w-full max-w-xl px-4">
        {TYPE_GROUPS.map((group) => (
          <div key={group.name}>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 px-1">{group.name}</div>
            <div className="grid grid-cols-5 gap-2">
              {group.types.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.t}
                    onClick={() => addComponent(t.t)}
                    className="flex flex-col items-center gap-1.5 px-2 py-4 rounded-xl
                      bg-slate-800/60 border border-slate-700/50
                      hover:bg-slate-700/60 hover:border-primary/40
                      transition-all duration-200 group cursor-pointer"
                  >
                    <Icon className={`w-6 h-6 ${t.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-white text-[11px] font-medium">{t.label}</span>
                    <span className="text-slate-500 text-[9px]">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
        {["左侧栏管理构件树", "右键拖拽旋转场景", "右侧面板调整参数", "导出报表或 AI 辅助"].map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            {i > 0 && <ArrowRight className="w-3 h-3 text-slate-700" />}
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-[10px] font-mono">{i + 1}</span>
              <span>{s}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-[10px] text-slate-600">
        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">滚轮</kbd><span>缩放</span>
        <span className="mx-1">·</span>
        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">中键</kbd><span>平移</span>
        <span className="mx-1">·</span>
        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">右键</kbd><span>旋转</span>
        <span className="mx-1">·</span>
        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">Ctrl+S</kbd><span>保存</span>
      </div>
    </div>
  );
}
```

**Step 4：验证**

```bash
npm run dev
# 打开 http://localhost:3000
# 预期：首次打开看到欢迎引导界面，有 10 个构件类型的快捷添加按钮
# 点击按钮可添加构件，添加后自动切换到 3D 场景
```

**Step 5：提交**

```bash
git add -A
git commit -m "feat: 冷启动体验优化 — 欢迎空状态替代自动添加构件"
```

---

### Task 1.2：修复保存/加载 — IndexedDB 持久化层

**目标：** 用浏览器 IndexedDB 替代不存在 `/api/components` API，实现本地持久化。

**文件：**
- 新建：`lib/db.ts`（如尚不存在）
- 修改：`lib/store.ts`

**Step 1：检查 IndexedDB 封装是否存在**

```bash
# 检查文件
ls -la lib/db.ts
```

如果 `lib/db.ts` 已存在且包含 `saveProject`, `loadProject`, `listProjects`, `deleteProject` 等导出函数，跳到 Step 3。

**Step 2：创建 lib/db.ts**

```typescript
// IndexedDB 持久化层 — 零后端依赖的本地存储
import type { Component } from "./types";
import type { Blueprint } from "./store";

const DB_NAME = "rebar-quant";
const DB_VERSION = 2;
const STORE_PROJECTS = "projects";
const STORE_META = "meta";

export interface ProjectRecord {
  id: string;
  name: string;
  components: Component[];
  blueprint: Blueprint | null;
  createdAt: number;
  updatedAt: number;
  version: number;
  componentCount: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        const store = db.createObjectStore(STORE_PROJECTS, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
        store.createIndex("name", "name", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        const meta = db.createObjectStore(STORE_META, { keyPath: "key" });
        meta.put({ key: "currentProjectId", value: "" });
        meta.put({ key: "lastUsedTimestamp", value: 0 });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveProject(record: ProjectRecord): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_PROJECTS, "readwrite");
  tx.objectStore(STORE_PROJECTS).put(record);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadProject(id: string): Promise<ProjectRecord | null> {
  const db = await openDB();
  const tx = db.transaction(STORE_PROJECTS, "readonly");
  const req = tx.objectStore(STORE_PROJECTS).get(id);
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function listProjects(): Promise<ProjectRecord[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_PROJECTS, "readonly");
  const req = tx.objectStore(STORE_PROJECTS).getAll();
  return new Promise((resolve, reject) => {
    req.onsuccess = () => {
      const list = (req.result ?? []) as ProjectRecord[];
      list.sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteProject(id: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_PROJECTS, "readwrite");
  tx.objectStore(STORE_PROJECTS).delete(id);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getMeta(key: string): Promise<string | number | null> {
  const db = await openDB();
  const tx = db.transaction(STORE_META, "readonly");
  const req = tx.objectStore(STORE_META).get(key);
  return new Promise((resolve) => {
    req.onsuccess = () => resolve(req.result?.value ?? null);
    req.onerror = () => resolve(null);
  });
}

export async function setMeta(key: string, value: string | number): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_META, "readwrite");
  tx.objectStore(STORE_META).put({ key, value });
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function genProjectId(): string {
  return `proj_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== "undefined" && !!indexedDB.open;
  } catch {
    return false;
  }
}
```

**Step 3：集成到 store.ts — 添加持久化方法**

在 `lib/store.ts` 中，确认以下内容已存在。如不存在，逐项添加：

**3a. 文件顶部导入：**

```typescript
import {
  saveProject,
  loadProject,
  listProjects,
  deleteProject,
  genProjectId,
  isIndexedDBAvailable,
  type ProjectRecord,
} from "./db";
```

**3b. State 接口中新增字段：**

```typescript
interface State {
  // ... 已有字段 ...
  projectId: string | null;        // IndexedDB 项目 ID
  projectList: ProjectRecord[];    // 项目列表
  saveStatus: "saved" | "saving" | "unsaved";
  // ... 其他已有字段 ...

  // 持久化方法
  saveToDB: () => Promise<void>;
  loadFromDB: (id: string) => Promise<boolean>;
  listFromDB: () => Promise<void>;
  deleteFromDB: (id: string) => Promise<void>;
  newProject: () => void;
}
```

**3c. 初始状态：**

```typescript
export const useStore = create<State>((set, get) => ({
  projectName: "未命名项目",
  projectId: null,
  projectList: [],
  saveStatus: "saved",
  // ... 其余字段保持现有值 ...

  saveToDB: async () => {
    const s = get();
    if (!isIndexedDBAvailable()) {
      console.error("IndexedDB 不可用");
      return;
    }
    set({ saveStatus: "saving" });
    try {
      const record: ProjectRecord = {
        id: s.projectId ?? genProjectId(),
        name: s.projectName,
        components: s.components,
        blueprint: s.blueprint,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
        componentCount: s.components.length,
      };
      await saveProject(record);
      set({ projectId: record.id, saveStatus: "saved" });
      get().listFromDB();
    } catch {
      set({ saveStatus: "unsaved" });
      console.error("IndexedDB 保存失败");
    }
  },

  loadFromDB: async (id) => {
    try {
      const record = await loadProject(id);
      if (!record) return false;
      set({
        projectId: record.id,
        projectName: record.name,
        components: record.components,
        blueprint: record.blueprint,
        selectedId: null,
        saveStatus: "saved",
      });
      get().revalidate();
      return true;
    } catch {
      console.error("IndexedDB 加载失败");
      return false;
    }
  },

  listFromDB: async () => {
    try {
      const list = await listProjects();
      set({ projectList: list });
    } catch { /* 静默失败 */ }
  },

  deleteFromDB: async (id) => {
    try {
      await deleteProject(id);
      set((s) => {
        const list = s.projectList.filter((p) => p.id !== id);
        if (s.projectId === id) {
          return { projectList: list, projectId: null, projectName: "未命名项目", components: [], blueprint: null, selectedId: null };
        }
        return { projectList: list };
      });
    } catch {
      console.error("IndexedDB 删除失败");
    }
  },

  newProject: () => {
    set({
      projectId: null,
      projectName: "未命名项目",
      components: [],
      blueprint: null,
      selectedId: null,
      saveStatus: "saved",
      validations: [],
    });
  },
}));
```

**3d. 标记状态变更为 "未保存"：**

在 `addComponent`, `removeComponent`, `updateComponent`, `setProjectName` 方法中，确保每个状态变更都设置了 `saveStatus: "unsaved"`。

在 `addComponent` 方法中添加：
```typescript
addComponent: (t) => {
  const c = defaultComponent(t);
  set((s) => ({ components: [...s.components, c], selectedId: c.id, saveStatus: "unsaved" }));
  get().revalidate();
  return c.id;
},
```

在 `removeComponent` 中：
```typescript
removeComponent: (id) => {
  set((s) => ({
    components: s.components.filter((ci) => ci.id !== id),
    selectedId: s.selectedId === id ? null : s.selectedId,
    saveStatus: "unsaved",
  }));
},
```

在 `updateComponent` 中：
```typescript
updateComponent: (id, patch) => {
  set((s) => ({
    components: s.components.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    saveStatus: "unsaved",
  }));
  get().revalidate();
},
```

在 `setProjectName` 中：
```typescript
setProjectName: (n) => set({ projectName: n, saveStatus: "unsaved" }),
```

**Step 4：验证**

```bash
npm run build   # 确保类型检查通过
npm run dev
# 打开 http://localhost:3000
# 1. 添加一个构件，查看浏览器 DevTools > Application > IndexedDB > rebar-quant
#    确认有 projects store 且有数据
# 2. 刷新页面，确认构件不丢失
```

**Step 5：提交**

```bash
git add -A
git commit -m "feat: IndexedDB 持久化层 + store 集成"
```

---

## 阶段二：用户体验提升（2-3天）

### Task 2.1：项目管理对话框

**目标：** 用户可以新建/打开/删除项目，在多个项目间切换。

**文件：**
- 新建：`components/ProjectManager.tsx`（如不存在）
- 修改：`components/TopBar.tsx`

**Step 1：检查是否已有 ProjectManager**

```bash
ls -la components/ProjectManager.tsx
```

如果文件存在且导出了接受 `{ onClose: () => void }` props 的组件，跳到 Step 3。

**Step 2：创建 ProjectManager.tsx**

```typescript
"use client";
import { useState, useEffect } from "react";
import { X, HardHat, Trash2, FolderOpen, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { genProjectId } from "@/lib/db";

interface Props { onClose: () => void; }

export default function ProjectManager({ onClose }: Props) {
  const projectList = useStore((s) => s.projectList);
  const loadFromDB = useStore((s) => s.loadFromDB);
  const deleteFromDB = useStore((s) => s.deleteFromDB);
  const listFromDB = useStore((s) => s.listFromDB);
  const newProject = useStore((s) => s.newProject);

  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => { listFromDB(); }, [listFromDB]);

  const handleDelete = async (id: string) => { setDeleteConfirm(id); };
  const confirmDelete = async (id: string) => { await deleteFromDB(id); setDeleteConfirm(null); };

  const handleOpen = async (id: string) => {
    setLoading(true);
    const ok = await loadFromDB(id);
    setLoading(false);
    if (ok) onClose();
  };

  const fmtDate = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return "今天";
    if (diffDays === 1) return "昨天";
    if (diffDays < 7) return `${diffDays}天前`;
    return d.toLocaleDateString("zh-CN");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="panel w-[600px] max-h-[70vh] p-4 shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <HardHat className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-lg font-bold text-on-surface">项目管理</h3>
              <p className="text-xs text-on-surface-variant">打开或管理已有项目</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant">
            <X className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => { newProject(); onClose(); }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-outline-variant/30 hover:border-primary/50 text-on-surface-variant hover:text-primary transition-colors mb-4"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">新建项目</span>
        </button>

        <div className="flex-1 overflow-y-auto space-y-2">
          {projectList.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant text-sm">
              暂无保存的项目<br />创建构件后，项目会自动保存到浏览器
            </div>
          )}
          {projectList.map((p) => (
            <div key={p.id}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-surface-container-high/30 hover:bg-surface-container-high/60 border border-outline-variant/10 group transition-colors"
            >
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleOpen(p.id)}>
                <div className="font-medium text-on-surface truncate">{p.name}</div>
                <div className="flex items-center gap-3 text-[11px] text-on-surface-variant mt-0.5">
                  <span>{p.componentCount} 个构件</span>
                  <span>修改于 {fmtDate(p.updatedAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 rounded hover:bg-surface-container-high text-primary" onClick={() => handleOpen(p.id)} title="打开项目">
                  <FolderOpen className="w-4 h-4" />
                </button>
                {deleteConfirm === p.id ? (
                  <div className="flex items-center gap-1">
                    <button className="px-2 py-1 rounded bg-error/20 text-error text-xs font-medium" onClick={() => confirmDelete(p.id)}>确认删除</button>
                    <button className="px-2 py-1 rounded bg-surface-container-high text-on-surface-variant text-xs" onClick={() => setDeleteConfirm(null)}>取消</button>
                  </div>
                ) : (
                  <button className="p-1.5 rounded hover:bg-error/10 text-on-surface-variant hover:text-error" onClick={() => handleDelete(p.id)} title="删除项目">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {loading && <div className="text-center text-sm text-on-surface-variant mt-4">加载中...</div>}
      </div>
    </div>
  );
}
```

**Step 3：集成到 TopBar.tsx**

在 `components/TopBar.tsx` 中确认：
- 文件顶部已导入 `import ProjectManager from "./ProjectManager";`
- 有 `const [showProjectMgr, setShowProjectMgr] = useState(false);`
- "文件"下拉菜单中有"打开..."按钮：`<DropdownItem icon={...} label="打开..." onClick={() => setShowProjectMgr(true)} />`
- 文件末尾有 `{showProjectMgr && <ProjectManager onClose={() => setShowProjectMgr(false)} />}`

**Step 4：验证**

```bash
npm run dev
# 1. 添加几个构件
# 2. 顶部菜单 → 文件 → 打开... → 确认看到项目列表
# 3. 新建项目 → 确认切换到空白工作区
# 4. 打开之前保存的项目 → 确认恢复全部构件
# 5. 删除项目 → 确认带确认对话框
```

**Step 5：提交**

```bash
git add -A
git commit -m "feat: 项目管理对话框 — 新建/打开/删除项目"
```

---

### Task 2.2：自动保存 + 快捷键

**目标：** 状态变更 3 秒后自动保存，保存状态有视觉反馈。支持 Ctrl+S/N/O 快捷键。

**文件：** `components/TopBar.tsx`

**Step 1：添加自动保存 debounce**

在 TopBar.tsx 中添加以下内容（确认已有或追加）：

```typescript
const AUTO_SAVE_DELAY = 3000;

const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

// 自动保存 debounce — 在 useEffect 中
useEffect(() => {
  if (saveStatus !== "unsaved" || components.length === 0) return;
  if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
  autoSaveTimer.current = setTimeout(() => { saveToDB(); }, AUTO_SAVE_DELAY);
  return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
}, [saveStatus, components.length, saveToDB]);
```

**Step 2：添加保存状态图标**

```typescript
import { CheckCircle, Loader2, CircleDot } from "lucide-react";

const statusIcon = () => {
  if (saveStatus === "saving") return <Loader2 className="w-3 h-3 animate-spin text-amber-400" />;
  if (saveStatus === "unsaved") return <CircleDot className="w-3 h-3 text-slate-500" />;
  return <CheckCircle className="w-3 h-3 text-emerald-400" />;
};

const statusLabel = () => {
  if (saveStatus === "saving") return "保存中...";
  if (saveStatus === "unsaved") return "未保存";
  return "已保存";
};
```

并在项目名称输入框旁边渲染：
```tsx
<span className="flex items-center gap-1 text-[10px] text-on-surface-variant" title={statusLabel()}>
  {statusIcon()}
  <span className="hidden sm:inline">{statusLabel()}</span>
</span>
```

**Step 3：添加快捷键**

```typescript
useEffect(() => {
  const onKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); saveToDB(); }
    if ((e.ctrlKey || e.metaKey) && e.key === "n") { e.preventDefault(); newProject(); }
    if ((e.ctrlKey || e.metaKey) && e.key === "o") { e.preventDefault(); setShowProjectMgr(true); }
  };
  window.addEventListener("keydown", onKeyDown);
  return () => window.removeEventListener("keydown", onKeyDown);
}, [saveToDB, newProject]);
```

**Step 4：验证**

```bash
npm run dev
# 1. 添加一个构件 → 观察保存状态图标变化：未保存 → 3秒后 → 已保存
# 2. 修改项目名称 → 同上
# 3. Ctrl+S → 立即触发保存
# 4. Ctrl+N → 新建项目
# 5. Ctrl+O → 打开项目管理器
```

**Step 5：提交**

```bash
git add -A
git commit -m "feat: 自动保存(3s防抖) + 保存状态指示器 + 快捷键支持"
```

---

### Task 2.3：AI Key 安全存储

**目标：** 将 AI 配置从 localStorage 迁移到 sessionStorage（关闭标签页即清除），同时支持服务端环境变量回退。

**文件：**
- 修改：`components/SettingsDialog.tsx`
- 修改：`app/api/ai/chat/route.ts`

**Step 1：SettingsDialog — localStorage → sessionStorage**

在 `components/SettingsDialog.tsx` 中，将 `loadAIConfig` 和 `saveAIConfig` 中的存储方式从 `localStorage` 改为 `sessionStorage`：

找到以下代码（约第 5 行）：
```typescript
const KEY = "rebar-quant.aiConfig.v3";

export function loadAIConfig(): AIConfig {
  // ...
  const raw = localStorage.getItem(KEY);  // ← 改这里
  // ...
}

export function saveAIConfig(cfg: AIConfig) {
  // ...
  localStorage.setItem(KEY, JSON.stringify(cfg));  // ← 改这里
  // ...
}
```

改为：
```typescript
const KEY = "rebar-quant.aiConfig.v3";

export function loadAIConfig(): AIConfig {
  if (typeof window === "undefined") return { baseUrl: "", model: "", apiKey: "", temperature: 0.3 };
  try {
    const raw = sessionStorage.getItem(KEY);  // ← 改为 sessionStorage
    if (raw) {
      const c = JSON.parse(raw);
      return {
        baseUrl: c.baseUrl || "",
        model: c.model || "",
        apiKey: c.apiKey || "",
        temperature: typeof c.temperature === "number" ? c.temperature : 0.3,
      };
    }
  } catch {}
  return { baseUrl: "", model: "", apiKey: "", temperature: 0.3 };
}

export function saveAIConfig(cfg: AIConfig) {
  if (typeof window === "undefined") return;
  try { sessionStorage.setItem(KEY, JSON.stringify(cfg)); } catch {}  // ← 改为 sessionStorage
}
```

**同时更新 UI 提示文字**（约第 199 行附近），将：
```
配置存于浏览器 localStorage
```
改为：
```
配置仅在当前会话有效（sessionStorage），关闭页面即清除。<br />部署时可用环境变量 AI_BASE_URL / AI_API_KEY / AI_MODEL 预置。
```

**Step 2：route.ts — 服务端环境变量回退**

在 `app/api/ai/chat/route.ts` 中确认已有以下代码（约第 20-22 行和 35-46 行）：

```typescript
// 服务端默认配置（从环境变量读取）
const SERVER_BASE_URL = process.env.AI_BASE_URL ?? "";
const SERVER_API_KEY = process.env.AI_API_KEY ?? "";
const SERVER_MODEL = process.env.AI_MODEL ?? "";

export async function POST(req: NextRequest) {
  const body = await req.json();
  // ... 字段解析 ...

  // 优先使用客户端配置，其次服务端环境变量
  const finalBaseUrl = baseUrl || SERVER_BASE_URL;
  const finalApiKey = apiKey || SERVER_API_KEY;
  const finalModel = model || SERVER_MODEL;

  if (!finalBaseUrl || !finalApiKey || !finalModel) {
    return NextResponse.json(
      { error: "AI 未配置，请在设置中填写，或在部署时配置 AI_BASE_URL / AI_API_KEY / AI_MODEL 环境变量。" },
      { status: 400 },
    );
  }
  // ...
}
```

如果已有则跳过，否则添加。

**Step 3：验证**

```bash
npm run dev
# 1. 打开 AI 设置 → 填入 Base URL + API Key + Model → 保存
# 2. 关闭标签页，重新打开
# 3. 打开 AI 设置 → 确认 API Key 已清空（sessionStorage 特性）
# 4. 如需持久化部署，在 .env.local 中添加：
#    AI_BASE_URL=https://api.deepseek.com/v1
#    AI_API_KEY=sk-xxx
#    AI_MODEL=deepseek-chat
# 然后验证即使 sessionStorage 中无配置，AI 仍然可正常工作
```

**Step 4：提交**

```bash
git add -A
git commit -m "feat: AI Key 安全存储 — localStorage→sessionStorage + 服务端环境变量回退"
```

---

### Task 2.4：AI 流式输出（SSE）

**目标：** AI 回答逐字显示，不再等待完整响应。

**文件：**
- 修改：`app/api/ai/chat/route.ts`
- 修改：`components/AIPanel.tsx`

**Step 1：route.ts — SSE 流式响应**

检查 `app/api/ai/chat/route.ts` 中约第 80-128 行是否已有流式响应处理逻辑：

```typescript
if (isStream) {
  // SSE 流式响应
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content ?? "";
                if (content) {
                  controller.enqueue(encoder.encode(content));
                }
              } catch { /* 跳过无法解析的 chunk */ }
            }
          }
        }
        controller.enqueue(encoder.encode("__STREAM_DONE__"));
      } catch (e: any) {
        controller.enqueue(encoder.encode(`\n\n[错误: ${e.message}]`));
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache",
    },
  });
}
```

如果已有，跳过。如果只有非流式响应，添加上面代码。

**Step 2：AIPanel.tsx — 前端流式读取**

检查 `components/AIPanel.tsx` 中 `send()` 函数约第 244-301 行是否有流式读取逻辑：

确认以下几点：
1. 请求体中设置了 `stream: true`
2. 有 `const [streamingContent, setStreamingContent] = useState("");`
3. 有逐 chunk 读取 + `setStreamingContent(full)` 更新
4. 有 `streamingContent` 的 UI 渲染（渲染正在生成的 Markdown 内容）

期望的前端流式读取代码参考：

```typescript
// 流式读取
const reader = r.body!.getReader();
const decoder = new TextDecoder();
let full = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value, { stream: true });
  if (chunk === "__STREAM_DONE__") break;
  full += chunk;
  setStreamingContent(full);
}

setMsgs((m) => [...m, { role: "assistant", content: full }]);
setStreamingContent("");
applyOps(full);
```

确认 `streamingContent` 的渲染在消息列表末尾（约第 414-427 行），带有闪烁光标动画。

**Step 3：验证**

```bash
npm run dev
# 1. 配置 AI → 发送一条消息（如"新建一根梁 KL3，300x600x8000"）
# 2. 确认回答逐字显示，而非等待一次性出现
# 3. 确认流式完成后带闪烁光标的行消失
# 4. 如果 AI 响应包含 ```json 操作指令，确认卡片正确渲染
```

**Step 4：提交**

```bash
git add -A
git commit -m "feat: AI 流式输出 SSE — 后端 SSE 转发 + 前端逐字显示"
```

---

## 阶段三：功能增强（3-5天）

### Task 3.1：PDF 图纸直接导入

**目标：** 用户可以直接导入 PDF 图纸，自动渲染为图片贴到 3D 场景。

**文件：**
- 修改：`components/DrawingImport.tsx`
- 新建：`lib/pdf/renderer.ts`（如不存在）
- 依赖：`pdfjs-dist`

**Step 1：安装依赖**

```bash
npm install pdfjs-dist
npm install --save-dev @types/pdfjs-dist
```

**Step 2：创建 lib/pdf/renderer.ts**

检查文件是否存在：
```bash
ls -la lib/pdf/renderer.ts
```

如果不存在，创建：

```typescript
// PDF 渲染服务 — 使用 pdfjs-dist 将 PDF 逐页渲染为图片底图
export interface PdfRenderResult {
  dataUrl: string;       // PNG dataUrl
  widthMm: number;       // 宽度（像素数，1px = 1mm）
  heightMm: number;      // 高度（像素数）
  pageCount: number;     // 总页数
  pageIndex: number;     // 当前渲染页码（0-based）
}

async function getPdfJs(): Promise<typeof import("pdfjs-dist")> {
  const pdfjs = await import("pdfjs-dist");
  const version = (pdfjs as any).version ?? "4.0.379";
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
  return pdfjs;
}

export async function renderPdfPageToImage(
  file: File,
  pageIndex: number = 0,
  scale: number = 2,
): Promise<PdfRenderResult> {
  const pdfjs = await getPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvas: canvas, canvasContext: ctx, viewport }).promise;

  return {
    dataUrl: canvas.toDataURL("image/png"),
    widthMm: viewport.width,
    heightMm: viewport.height,
    pageCount: pdf.numPages,
    pageIndex,
  };
}

export async function getPdfPageCount(file: File): Promise<number> {
  const pdfjs = await getPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  return pdf.numPages;
}
```

**Step 3：集成到 DrawingImport.tsx**

检查 `components/DrawingImport.tsx` 是否已有 PDF 处理逻辑。关键检查点：

1. **文件顶部导入**（约第 6 行）：
```typescript
import { renderPdfPageToImage, getPdfPageCount, type PdfRenderResult } from "@/lib/pdf/renderer";
```

2. **PDF 状态变量**（约第 29-33 行）：
```typescript
const [pdfPageCount, setPdfPageCount] = useState(0);
const [pdfPageIndex, setPdfPageIndex] = useState(0);
const [pdfRenderResult, setPdfRenderResult] = useState<PdfRenderResult | null>(null);
const [pdfQuality, setPdfQuality] = useState<1 | 2 | 3>(2);
```

3. **PDF 文件处理**（约第 80-85 行，在 `onFile` 中）：
```typescript
} else if (f.type === "application/pdf" || /\.pdf$/i.test(f.name)) {
  setMode("pdf");
  setFileRef(f);
  const url = URL.createObjectURL(f);
  setUrl(url);
  // 加载 PDF 页数并自动渲染第一页
  (async () => {
    try {
      const count = await getPdfPageCount(f);
      setPdfPageCount(count);
      const result = await renderPdfPageToImage(f, 0, 2);
      setPdfRenderResult(result);
    } catch { setErr("PDF 解析失败"); }
  })();
}
```

4. **PDF UI**：在 `return` 中 mode === "pdf" 时显示页面选择器 + 发送到场景按钮

如果以上均已有，跳到验证步骤。

**Step 4：验证**

```bash
npm run dev
# 1. 顶部菜单 → 图纸 → PDF 导入
# 2. 选择一个多页 PDF 文件
# 3. 确认显示页面选择器，可切换页码
# 4. 点击"发送到 3D 场景"→ 确认 PDF 作为底图出现在场景中
# 5. 底图可拖动、缩放
```

**Step 5：提交**

```bash
git add -A
git commit -m "feat: PDF 图纸直接导入 — pdfjs-dist 渲染 → 场景底图"
```

---

### Task 3.2：InstancedMesh 大模型性能优化

**目标：** 同类型构件合并为 InstancedMesh，将 draw call 从 N 降为 1，500+ 构件时帧率从 15fps 提升到 55fps。

**文件：**
- 新建：`lib/three/instanced.ts`（如不存在）
- 修改：`components/Scene3D.tsx`

**Step 1：检查 instanced.ts 是否存在**

```bash
ls -la lib/three/instanced.ts
```

如果文件已存在且导出了 `buildInstancedScene` 和 `getComponentIdFromHit`，跳到 Step 3。

**Step 2：创建 lib/three/instanced.ts**（核心代码，完整版从需求文档第 8 节复制 — 此文件约 275 行，包含分组键、基础几何体创建、InstancedMesh 构建、钢筋管渲染、鼠标拾取映射）

完整代码见需求文档中 Section 8 的代码示例。

**Step 3：Scene3D.tsx 集成 InstancedMesh**

检查 `components/Scene3D.tsx` 中是否已导入并使用 InstancedMesh：

```typescript
import { buildInstancedScene, getComponentIdFromHit } from "@/lib/three/instanced";
```

在重建场景时（约在 `useEffect` 中 components 变化时），使用：

```typescript
// 替代逐个创建 Mesh 的方式
const { concreteInstances, rebarObjects } = buildInstancedScene(
  components,
  selectedId,
  { showConcrete, showRebar, concreteOpacity }
);

// 添加到场景
const group = groupRef.current!;
group.clear();
concreteInstances.forEach((im) => group.add(im));
rebarObjects.forEach((obj) => group.add(obj));
```

同时在鼠标点击拾取时使用 `getComponentIdFromHit` 来映射 InstancedMesh 的 instanceId 到构件 ID。

**Step 4：验证**

```bash
npm run dev
# 1. 添加 20+ 根梁（相同截面尺寸）
# 2. 打开 DevTools > Performance > 录制
# 3. 旋转场景，确认帧率 ≥ 55fps
# 4. 点击不同构件 → 确认高亮正确的构件
# 5. 添加大量构件（50+），确认依然流畅
```

**Step 5：提交**

```bash
git add -A
git commit -m "perf: InstancedMesh 性能优化 — 同几何构件合并为单个 draw call"
```

---

## 阶段四：打磨与测试（2-3天）

### Task 4.1：移动端响应式适配

**目标：** 确保项目在移动设备上可用。

**检查项：**
- [ ] 顶部导航栏在窄屏幕下正确折叠
- [ ] 3D 视口在触摸设备上支持手势（旋转/缩放/平移）
- [ ] WelcomeEmpty 在手机上正常显示
- [ ] 项目管理对话框在小屏幕上自适应

**提交：**

```bash
git add -A
git commit -m "fix: 移动端响应式适配"
```

---

### Task 4.2：错误边界处理

**目标：** IndexedDB 不可用时（隐私模式等）优雅降级。

**检查项：**
- [ ] `lib/db.ts` 导出 `isIndexedDBAvailable()` 函数
- [ ] store.ts 中 `saveToDB` 在 IndexedDB 不可用时静默跳过而非报错
- [ ] TopBar 中显示"浏览器不支持本地存储"的提示
- [ ] AI Key 会话过期时友好提示

**提交：**

```bash
git add -A
git commit -m "fix: IndexedDB 不可用时的优雅降级"
```

---

### Task 4.3：部署验证

**目标：** 验证项目可正常构建和部署。

```bash
npm run build     # 确保无错误
npm run lint      # 确保无 lint 报错
npm run dev       # 验证开发模式正常
```

**可选 — 部署到 Netlify：**

```bash
# 推送到 GitHub，在 Netlify 上部署
# 或直接使用 Vercel: vercel --prod
```

**提交：**

```bash
git add -A
git commit -m "chore: 构建验证 + 部署准备"
```

---

## 文件变更清单总表

| # | 操作 | 文件 | 阶段 |
|---|------|------|------|
| 1 | **新建** | `lib/db.ts` | 阶段一 |
| 2 | **新建** | `components/WelcomeEmpty.tsx` | 阶段一 |
| 3 | **修改** | `app/page.tsx` | 阶段一 |
| 4 | **修改** | `lib/store.ts` | 阶段一 |
| 5 | **新建** | `components/ProjectManager.tsx` | 阶段二 |
| 6 | **修改** | `components/TopBar.tsx` | 阶段二 |
| 7 | **修改** | `components/SettingsDialog.tsx` | 阶段二 |
| 8 | **修改** | `app/api/ai/chat/route.ts` | 阶段二 |
| 9 | **修改** | `components/AIPanel.tsx` | 阶段二 |
| 10 | **新建** | `lib/pdf/renderer.ts` | 阶段三 |
| 11 | **修改** | `components/DrawingImport.tsx` | 阶段三 |
| 12 | **新建** | `lib/three/instanced.ts` | 阶段三 |
| 13 | **修改** | `components/Scene3D.tsx` | 阶段三 |

---

## 实施优先级矩阵

```
                      │  高用户影响  │  低用户影响
──────────────────────┼─────────────┼─────────────
  低实现成本 (≤1天)   │ 1.1 冷启动   │ 2.3 AI Key安全
                      │ 1.2 保存修复 │
──────────────────────┼─────────────┼─────────────
  高实现成本 (≥2天)   │ 2.4 SSE流式  │ 3.2 InstancedMesh
                      │ 2.1 项目管理│ 3.1 PDF导入
                      │ 2.2 自动保存│
```

**必须按顺序执行**：阶段一 → 阶段二 → 阶段三 → 阶段四。前后任务有依赖关系。

---

*计划生成时间：2026-05-31*
*基于 BIM.Core_产品优化实施方案.md v0.1.0*
