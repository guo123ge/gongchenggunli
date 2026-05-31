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
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

