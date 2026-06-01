import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("123456", 10);

  const project = await prisma.project.upsert({
    where: { code: "JWKC-2026-02" },
    update: {},
    create: {
      name: "江湾科创中心二期总承包工程",
      code: "JWKC-2026-02",
      location: "上海市浦东新区银城路 88 号",
      startDate: new Date("2026-03-01"),
      plannedEndDate: new Date("2027-08-31"),
      owner: "江湾城市建设集团",
      contractor: "华东建设总承包有限公司",
      supervisor: "正衡工程监理有限公司",
      status: "in_progress",
    },
  });

  const roleUsers = [
    ["pm", "周项目", "PM"],
    ["con", "林施工", "CON"],
    ["tech", "吴技术", "TECH"],
    ["safe", "陈安全", "SAFE"],
    ["mat", "何材料", "MAT"],
    ["doc", "宋资料", "DOC"],
    ["mach", "赵机械", "MACH"],
  ] as const;

  for (const [username, displayName, role] of roleUsers) {
    const user = await prisma.user.upsert({
      where: { username },
      update: {},
      create: {
        username,
        displayName,
        phone: `1380000000${roleUsers.findIndex((item) => item[0] === username) + 1}`,
        passwordHash,
        globalRole: role === "PM" ? "admin" : "user",
      },
    });

    await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: project.id, userId: user.id } },
      update: { role },
      create: { projectId: project.id, userId: user.id, role },
    });
  }

  const materials = [
    ["HRB400E 钢筋", "钢筋", "C16-C25", "吨", 45, 38],
    ["C35 商品混凝土", "混凝土", "P8 抗渗", "m3", 120, 520],
    ["SBS 防水卷材", "防水", "4mm II 型", "m2", 800, 640],
  ] as const;

  for (const [name, category, spec, unit, safetyStock, currentStock] of materials) {
    await prisma.material.upsert({
      where: { projectId_name_spec: { projectId: project.id, name, spec } },
      update: { safetyStock, currentStock },
      create: { projectId: project.id, name, category, spec, unit, safetyStock, currentStock },
    });
  }

  const con = await prisma.user.findUniqueOrThrow({ where: { username: "con" } });
  const pm = await prisma.user.findUniqueOrThrow({ where: { username: "pm" } });
  const mat = await prisma.user.findUniqueOrThrow({ where: { username: "mat" } });
  const safe = await prisma.user.findUniqueOrThrow({ where: { username: "safe" } });
  const mach = await prisma.user.findUniqueOrThrow({ where: { username: "mach" } });
  const doc = await prisma.user.findUniqueOrThrow({ where: { username: "doc" } });
  const steel = await prisma.material.findFirstOrThrow({ where: { projectId: project.id, name: "HRB400E 钢筋" } });
  const concrete = await prisma.material.findFirstOrThrow({ where: { projectId: project.id, name: "C35 商品混凝土" } });

  await prisma.dailyLog.create({
    data: {
      projectId: project.id,
      workDate: new Date("2026-05-31"),
      weather: "晴",
      tempLow: 22,
      tempHigh: 31,
      workContent: "地下室 B 区顶板混凝土浇筑完成，现场同步完成养护覆盖。",
      workPosition: "地下室 B 区",
      workProcess: "混凝土浇筑",
      laborCount: 46,
      laborDetail: JSON.stringify([{ type: "混凝土工", count: 18 }]),
      machineryUsed: JSON.stringify(["汽车泵", "插入式振捣器", "塔吊 2#"]),
      materialUsed: JSON.stringify([{ name: "C35 商品混凝土", quantity: 238, unit: "m3" }]),
      qualityCheck: "现场取样 3 组，塌落度 180mm，满足浇筑要求。",
      safetyCheck: "临边洞口防护齐全，泵车支腿垫板符合要求。",
      status: "submitted",
      submittedById: con.id,
    },
  });

  await prisma.stockIn.create({
    data: {
      projectId: project.id,
      materialId: steel.id,
      billNo: `RK-SEED-${Date.now()}`,
      supplier: "申钢物资",
      quantity: 32,
      status: "submitted",
      submittedById: mat.id,
    },
  });

  await prisma.stockOut.create({
    data: {
      projectId: project.id,
      materialId: concrete.id,
      billNo: `CK-SEED-${Date.now()}`,
      receiver: "混凝土班组",
      usagePosition: "地下室 B 区",
      quantity: 20,
      status: "draft",
      submittedById: mat.id,
    },
  });

  await prisma.safetyHazard.create({
    data: {
      projectId: project.id,
      title: "基坑北侧材料临时堆放距边坡过近",
      area: "基坑北侧",
      riskLevel: "high",
      description: "材料堆放距离边坡不足 1.5m，需要立即清理。",
      rectification: "清理边坡附近材料并设置警戒线。",
      status: "rectifying",
      dueDate: new Date("2026-06-02"),
      submittedById: safe.id,
    },
  });

  await prisma.machinery.create({
    data: {
      projectId: project.id,
      name: "塔吊 1#",
      code: "TC6015-01",
      model: "TC6015",
      operator: "张师傅",
      status: "onsite",
      enteredAt: new Date("2026-03-12"),
      nextMaintenanceDate: new Date("2026-06-05"),
      submittedById: mach.id,
      reviewedById: pm.id,
    },
  });

  await prisma.archive.create({
    data: {
      projectId: project.id,
      title: "钢筋原材复试报告",
      category: "试验资料",
      tags: "钢筋,复试,主体结构",
      version: "v1.0",
      status: "submitted",
      submittedById: doc.id,
    },
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
