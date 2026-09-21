// src/lib/prisma.ts
import "./bigint";
import { PrismaClient } from "@prisma/client";

console.log("[prisma.ts] module loaded from:", require.resolve("@prisma/client"));

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});
