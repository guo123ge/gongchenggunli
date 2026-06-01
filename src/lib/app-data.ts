import { isPrismaBackendEnabled } from "./data-backend";
import { readPrismaStore } from "./prisma-repository";
import { readStore } from "./server-store";

export async function readAppData() {
  if (isPrismaBackendEnabled()) return readPrismaStore();
  return readStore();
}
