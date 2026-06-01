export function isPrismaBackendEnabled() {
  return process.env.DATA_BACKEND === "prisma";
}
